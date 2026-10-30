package com.smartcampus.backend.assessment;

import com.smartcampus.backend.assessment.AssessmentModels.QuizView;
import com.smartcampus.backend.assessment.AttemptModels.*;
import com.smartcampus.backend.common.security.CourseAccess;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AttemptService {
    private static final Logger log = LoggerFactory.getLogger(AttemptService.class);

    /** Dung sai mạng khi nộp/lưu sát giờ. */
    private static final long GRACE_SECONDS = 30;

    private record Attempt(Long id, int number, LocalDateTime startTime) {}
    private record Limits(Integer durationMinutes, LocalDateTime endTime) {}
    private record QuestionRow(Long id, BigDecimal points) {}

    private final JdbcTemplate jdbc;
    private final CourseAccess access;
    private final AssessmentService assessments;

    public AttemptService(JdbcTemplate jdbc, CourseAccess access, AssessmentService assessments) {
        this.jdbc = jdbc;
        this.access = access;
        this.assessments = assessments;
    }

    // ---------------------------------------------------------------- bắt đầu / tiếp tục

    @Transactional
    public AttemptStart start(Long courseId, Long quizId) {
        Long studentId = requireStudent(courseId);
        // Kiểm tra: đã publish, đang trong khung giờ mở; câu hỏi trả về không có đáp án đúng
        QuizView quiz = assessments.getQuiz(courseId, quizId);
        Limits limits = limits(courseId, quizId);
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

        Attempt open = findOpen(quizId, studentId);
        if (open != null && pastGrace(deadline(open.startTime(), limits), now)) {
            close(open.id(), quizId, loadDrafts(open.id())); // lượt cũ đã quá hạn: chấm theo đáp án đã lưu
            open = null;
        }
        boolean resumed = open != null;
        if (!resumed) {
            Integer used = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM assessment_attempts WHERE assessment_id = ? AND student_id = ?",
                    Integer.class, quizId, studentId);
            int count = used == null ? 0 : used;
            if (count >= quiz.quiz().maxAttempts())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "No attempts left for this quiz");
            Long id = insert("""
                    INSERT INTO assessment_attempts (assessment_id, student_id, attempt_number, start_time, status)
                    VALUES (?, ?, ?, ?, 'IN_PROGRESS')
                    """, quizId, studentId, count + 1, now);
            open = new Attempt(id, count + 1, now);
        }

        LocalDateTime deadline = deadline(open.startTime(), limits);
        Long remaining = deadline == null ? null
                : Math.max(0, Duration.between(now, deadline).getSeconds());
        Map<Long, String> saved = resumed ? rawDrafts(open.id()) : Map.of();
        return new AttemptStart(open.id(), open.number(), remaining, quiz, saved);
    }

    // ---------------------------------------------------------------- tự động lưu

    @Transactional
    public void saveAnswers(Long courseId, Long quizId, Long attemptId, SubmitRequest request) {
        Long studentId = requireStudent(courseId);
        Limits limits = limits(courseId, quizId);
        Object[] row = attemptRow(attemptId, quizId, studentId);
        if (!"IN_PROGRESS".equals(row[1]))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Attempt already submitted");
        if (pastGrace(deadline((LocalDateTime) row[0], limits), LocalDateTime.now()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time is up");

        Set<Long> valid = new HashSet<>(jdbc.queryForList(
                "SELECT question_id FROM assessment_questions WHERE assessment_id = ?", Long.class, quizId));
        jdbc.update("DELETE FROM attempt_answers WHERE attempt_id = ?", attemptId);
        if (request == null || request.answers() == null) return;
        for (Map.Entry<Long, Long> e : request.answers().entrySet()) {
            if (!valid.contains(e.getKey()) || e.getValue() == null) continue;
            jdbc.update("""
                    INSERT INTO attempt_answers (attempt_id, question_id, answer_data)
                    VALUES (?, ?, CAST(? AS JSON))
                    """, attemptId, e.getKey(), String.valueOf(e.getValue()));
        }
    }

    // ---------------------------------------------------------------- nộp bài

    @Transactional
    public AttemptResult submit(Long courseId, Long quizId, Long attemptId, SubmitRequest request) {
        Long studentId = requireStudent(courseId);
        Limits limits = limits(courseId, quizId);
        Object[] row = attemptRow(attemptId, quizId, studentId);

        if ("IN_PROGRESS".equals(row[1])) { // nộp lần 2 thì chỉ trả lại kết quả cũ
            boolean late = pastGrace(deadline((LocalDateTime) row[0], limits), LocalDateTime.now());
            Map<Long, Long> answers = late || request == null || request.answers() == null
                    ? loadDrafts(attemptId) : request.answers();
            try {
                close(attemptId, quizId, answers);
            } catch (RuntimeException e) {
                log.error("Failed to grade attempt {} of quiz {}", attemptId, quizId, e);
                throw e;
            }
        }
        return result(attemptId, quizId);
    }

    // ---------------------------------------------------------------- lịch sử

    @Transactional
    public List<AttemptSummary> mine(Long courseId) {
        access.requireParticipant(courseId);
        if (!access.hasRole("STUDENT")) return List.of();
        Long studentId = access.userId();
        LocalDateTime now = LocalDateTime.now();

        // Lượt bỏ dở đã quá hạn: đóng và chấm theo đáp án đã lưu
        List<Object[]> open = jdbc.query("""
                SELECT a.id, a.assessment_id, a.start_time, s.duration_minutes, s.end_time
                FROM assessment_attempts a JOIN assessments s ON s.id = a.assessment_id
                WHERE s.course_id = ? AND a.student_id = ? AND a.status = 'IN_PROGRESS'
                """, (rs, i) -> new Object[]{rs.getLong(1), rs.getLong(2),
                rs.getTimestamp(3).toLocalDateTime(), rs.getObject(4),
                rs.getTimestamp(5) == null ? null : rs.getTimestamp(5).toLocalDateTime()}, courseId, studentId);
        for (Object[] r : open) {
            Limits lim = new Limits((Integer) r[3], (LocalDateTime) r[4]);
            if (pastGrace(deadline((LocalDateTime) r[2], lim), now))
                close((Long) r[0], (Long) r[1], loadDrafts((Long) r[0]));
        }

        return jdbc.query("""
                SELECT a.id, a.assessment_id, a.attempt_number, a.status, a.score, a.start_time, a.submit_time,
                       (SELECT COALESCE(SUM(aq.points), 0) FROM assessment_questions aq
                        WHERE aq.assessment_id = a.assessment_id) AS total_points
                FROM assessment_attempts a JOIN assessments s ON s.id = a.assessment_id
                WHERE s.course_id = ? AND a.student_id = ?
                ORDER BY a.assessment_id, a.attempt_number
                """, (rs, i) -> new AttemptSummary(rs.getLong("id"), rs.getLong("assessment_id"),
                rs.getInt("attempt_number"), rs.getString("status"), rs.getBigDecimal("score"),
                rs.getBigDecimal("total_points"), rs.getTimestamp("start_time").toLocalDateTime(),
                rs.getTimestamp("submit_time") == null ? null : rs.getTimestamp("submit_time").toLocalDateTime()),
                courseId, studentId);
    }

    // ---------------------------------------------------------------- chấm điểm

    private void close(Long attemptId, Long quizId, Map<Long, Long> answers) {
        List<QuestionRow> questions = jdbc.query("""
                SELECT q.id, aq.points
                FROM assessment_questions aq JOIN question_bank q ON q.id = aq.question_id
                WHERE aq.assessment_id = ? ORDER BY aq.order_index
                """, (rs, i) -> new QuestionRow(rs.getLong(1), rs.getBigDecimal(2)), quizId);

        jdbc.update("DELETE FROM attempt_answers WHERE attempt_id = ?", attemptId);

        BigDecimal earned = BigDecimal.ZERO;
        for (QuestionRow q : questions) {
            Long answer = answers.get(q.id()); // id option đã chọn, null = bỏ trống
            Set<Long> right = new HashSet<>(jdbc.queryForList(
                    "SELECT id FROM question_options WHERE question_id = ? AND is_correct = TRUE",
                    Long.class, q.id()));
            boolean correct = answer != null && right.contains(answer);
            BigDecimal score = correct ? q.points() : BigDecimal.ZERO;
            earned = earned.add(score);
            jdbc.update("""
                    INSERT INTO attempt_answers (attempt_id, question_id, answer_data, is_correct, score)
                    VALUES (?, ?, CAST(? AS JSON), ?, ?)
                    """, attemptId, q.id(), answer == null ? null : String.valueOf(answer), correct, score);
        }
        jdbc.update("UPDATE assessment_attempts SET submit_time = ?, score = ?, status = 'GRADED' WHERE id = ?",
                LocalDateTime.now(), earned, attemptId);
    }

    // ---------------------------------------------------------------- đáp án nháp

    private List<Object[]> draftRows(Long attemptId) {
        return jdbc.query("""
                SELECT question_id, answer_data FROM attempt_answers
                WHERE attempt_id = ? AND answer_data IS NOT NULL
                """, (rs, i) -> new Object[]{rs.getLong(1), rs.getString(2)}, attemptId);
    }

    private Map<Long, String> rawDrafts(Long attemptId) {
        Map<Long, String> out = new LinkedHashMap<>();
        for (Object[] r : draftRows(attemptId)) out.put((Long) r[0], (String) r[1]);
        return out;
    }

    private Map<Long, Long> loadDrafts(Long attemptId) {
        Map<Long, Long> out = new HashMap<>();
        for (Object[] r : draftRows(attemptId)) {
            try {
                out.put((Long) r[0], Long.parseLong(((String) r[1]).trim()));
            } catch (NumberFormatException ignored) {
                // dữ liệu nháp cũ (mảng/chuỗi) không còn hợp lệ: bỏ qua
            }
        }
        return out;
    }

    // ---------------------------------------------------------------- kết quả

    private AttemptResult result(Long attemptId, Long quizId) {
        Object[] attempt = jdbc.queryForObject(
                "SELECT status, score FROM assessment_attempts WHERE id = ?",
                (rs, i) -> new Object[]{rs.getString("status"), rs.getBigDecimal("score")}, attemptId);
        List<AnswerResult> answers = jdbc.query("""
                SELECT aa.question_id, aa.is_correct, aa.score
                FROM attempt_answers aa JOIN assessment_questions aq ON aq.question_id = aa.question_id
                WHERE aa.attempt_id = ? AND aq.assessment_id = ? ORDER BY aq.order_index
                """, (rs, i) -> {
            return new AnswerResult(rs.getLong("question_id"), rs.getBoolean("is_correct"),
                    rs.getBigDecimal("score"));
        }, attemptId, quizId);
        BigDecimal total = jdbc.queryForObject(
                "SELECT COALESCE(SUM(points), 0) FROM assessment_questions WHERE assessment_id = ?",
                BigDecimal.class, quizId);
        BigDecimal score = attempt[1] == null ? BigDecimal.ZERO : (BigDecimal) attempt[1];
        return new AttemptResult(attemptId, (String) attempt[0], score, total, answers);
    }

    // ---------------------------------------------------------------- tiện ích

    private Long requireStudent(Long courseId) {
        access.requireParticipant(courseId);
        if (!access.hasRole("STUDENT"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can take quizzes");
        return access.userId();
    }

    /** Trả {start_time, status} của lượt làm thuộc về sinh viên này. */
    private Object[] attemptRow(Long attemptId, Long quizId, Long studentId) {
        List<Object[]> rows = jdbc.query("""
                SELECT start_time, status FROM assessment_attempts
                WHERE id = ? AND assessment_id = ? AND student_id = ?
                """, (rs, i) -> new Object[]{rs.getTimestamp("start_time").toLocalDateTime(),
                rs.getString("status")}, attemptId, quizId, studentId);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found");
        return rows.get(0);
    }

    private Limits limits(Long courseId, Long quizId) {
        List<Limits> rows = jdbc.query(
                "SELECT duration_minutes, end_time FROM assessments WHERE id = ? AND course_id = ?",
                (rs, i) -> new Limits((Integer) rs.getObject("duration_minutes"),
                        rs.getTimestamp("end_time") == null ? null : rs.getTimestamp("end_time").toLocalDateTime()),
                quizId, courseId);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found");
        return rows.get(0);
    }

    private Attempt findOpen(Long quizId, Long studentId) {
        List<Attempt> rows = jdbc.query("""
                SELECT id, attempt_number, start_time FROM assessment_attempts
                WHERE assessment_id = ? AND student_id = ? AND status = 'IN_PROGRESS'
                ORDER BY attempt_number DESC LIMIT 1
                """, (rs, i) -> new Attempt(rs.getLong("id"), rs.getInt("attempt_number"),
                rs.getTimestamp("start_time").toLocalDateTime()), quizId, studentId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    /** Hạn nộp = min(start + thời lượng, giờ đóng). null = không giới hạn. */
    private static LocalDateTime deadline(LocalDateTime start, Limits limits) {
        LocalDateTime d = limits.durationMinutes() == null ? null : start.plusMinutes(limits.durationMinutes());
        if (limits.endTime() != null && (d == null || limits.endTime().isBefore(d))) d = limits.endTime();
        return d;
    }

    private static boolean pastGrace(LocalDateTime deadline, LocalDateTime now) {
        return deadline != null && now.isAfter(deadline.plusSeconds(GRACE_SECONDS));
    }

    private Long insert(String sql, Object... values) {
        GeneratedKeyHolder holder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int i = 0; i < values.length; i++) statement.setObject(i + 1, values[i]);
            return statement;
        }, holder);
        return holder.getKey().longValue();
    }
}