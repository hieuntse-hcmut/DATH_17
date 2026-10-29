package com.smartcampus.backend.assessment;

import com.smartcampus.backend.assessment.AssessmentModels.*;
import com.smartcampus.backend.common.security.CourseAccess;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AssessmentService {
    private final JdbcTemplate jdbc;
    private final CourseAccess access;

    public AssessmentService(JdbcTemplate jdbc, CourseAccess access) {
        this.jdbc = jdbc;
        this.access = access;
    }

    @Transactional
    public QuestionView createQuestion(Long courseId, QuestionInput input) {
        access.requireStaff(courseId);
        validateQuestion(input);
        Long id = insert("INSERT INTO question_bank (course_id, content, question_type) VALUES (?, ?, ?)",
                courseId, input.content().trim(), input.type());
        insertOptions(id, input.options());
        return question(id, true);
    }

    @Transactional
    public QuestionView updateQuestion(Long courseId, Long questionId, QuestionInput input) {
        access.requireStaff(courseId);
        requireQuestionCourse(courseId, questionId);
        Integer uses = jdbc.queryForObject("SELECT COUNT(*) FROM assessment_questions WHERE question_id = ?",
                Integer.class, questionId);
        if (uses != null && uses > 0) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Question is already used by a quiz");
        validateQuestion(input);
        jdbc.update("UPDATE question_bank SET content = ?, question_type = ? WHERE id = ?",
                input.content().trim(), input.type(), questionId);
        jdbc.update("DELETE FROM question_options WHERE question_id = ?", questionId);
        insertOptions(questionId, input.options());
        return question(questionId, true);
    }

    @Transactional
    public void deleteQuestion(Long courseId, Long questionId) {
        access.requireStaff(courseId);
        requireQuestionCourse(courseId, questionId);
        Integer uses = jdbc.queryForObject("SELECT COUNT(*) FROM assessment_questions WHERE question_id = ?",
                Integer.class, questionId);
        if (uses != null && uses > 0) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Question is already used by a quiz");
        jdbc.update("DELETE FROM question_bank WHERE id = ?", questionId);
    }

    public List<QuestionView> questions(Long courseId) {
        access.requireStaff(courseId);
        return jdbc.query("SELECT id FROM question_bank WHERE course_id = ? ORDER BY id", (rs, row) ->
                question(rs.getLong(1), true), courseId);
    }

    @Transactional
    public QuizView createQuiz(Long courseId, QuizInput input) {
        access.requireStaff(courseId);
        if (input.startTime() != null && input.endTime() != null
                && !input.endTime().isAfter(input.startTime())) badRequest("End time must be after start time");
        Set<Long> ids = new HashSet<>();
        for (QuizQuestionInput item : input.questions()) {
            if (!ids.add(item.questionId())) badRequest("Duplicate question in quiz");
            requireQuestionCourse(courseId, item.questionId());
        }
        Long id = insert("""
                INSERT INTO assessments (course_id, title, status, start_time, end_time, duration_minutes, max_attempts)
                VALUES (?, ?, 'DRAFT', ?, ?, ?, ?)
                """, courseId, input.title().trim(), input.startTime(), input.endTime(),
                input.durationMinutes(), input.maxAttempts());
        for (int i = 0; i < input.questions().size(); i++) {
            QuizQuestionInput item = input.questions().get(i);
            jdbc.update("""
                    INSERT INTO assessment_questions (assessment_id, question_id, order_index, points)
                    VALUES (?, ?, ?, ?)
                    """, id, item.questionId(), i, item.points());
        }
        return quiz(id, true);
    }

    @Transactional
    public QuizView publish(Long courseId, Long quizId) {
        access.requireStaff(courseId);
        QuizSummary summary = summary(courseId, quizId);
        if (!"DRAFT".equals(summary.status())) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Only draft quizzes can be published");
        jdbc.update("UPDATE assessments SET status = 'PUBLISHED' WHERE id = ?", quizId);
        return quiz(quizId, true);
    }

    public List<QuizSummary> quizzes(Long courseId) {
        access.requireParticipant(courseId);
        boolean student = access.hasRole("STUDENT");
        return jdbc.query("""
                SELECT id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts
                FROM assessments WHERE course_id = ? AND (? = FALSE OR status = 'PUBLISHED') ORDER BY id DESC
                """, (rs, row) -> new QuizSummary(rs.getLong("id"), rs.getLong("course_id"),
                rs.getString("title"), rs.getString("status"),
                rs.getTimestamp("start_time") == null ? null : rs.getTimestamp("start_time").toLocalDateTime(),
                rs.getTimestamp("end_time") == null ? null : rs.getTimestamp("end_time").toLocalDateTime(),
                (Integer) rs.getObject("duration_minutes"), rs.getInt("max_attempts")), courseId, student);
    }

    /**
     * Staff see the quiz with its answer key at any time.
     * A student sees the questions (without answers) only inside the availability window
     * (BR-ASSESSMENT-001); the list endpoint still shows the summary with its start/end times.
     */
    public QuizView getQuiz(Long courseId, Long quizId) {
        access.requireParticipant(courseId);
        QuizSummary summary = summary(courseId, quizId);
        boolean student = access.hasRole("STUDENT");
        if (student && !"PUBLISHED".equals(summary.status()))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found");
        if (student) requireOpen(summary);
        return quiz(quizId, !student);
    }

    private static void requireOpen(QuizSummary summary) {
        LocalDateTime now = LocalDateTime.now();
        if (summary.startTime() != null && now.isBefore(summary.startTime()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quiz is not open yet");
        if (summary.endTime() != null && now.isAfter(summary.endTime()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quiz is closed");
    }

    private QuizView quiz(Long quizId, boolean includeAnswers) {
        QuizSummary summary = jdbc.queryForObject("""
                SELECT id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts
                FROM assessments WHERE id = ?
                """, (rs, row) -> new QuizSummary(rs.getLong("id"), rs.getLong("course_id"),
                rs.getString("title"), rs.getString("status"),
                rs.getTimestamp("start_time") == null ? null : rs.getTimestamp("start_time").toLocalDateTime(),
                rs.getTimestamp("end_time") == null ? null : rs.getTimestamp("end_time").toLocalDateTime(),
                (Integer) rs.getObject("duration_minutes"), rs.getInt("max_attempts")), quizId);
        List<QuizQuestionView> items = jdbc.query("""
                SELECT question_id, order_index, points FROM assessment_questions
                WHERE assessment_id = ? ORDER BY order_index
                """, (rs, row) -> new QuizQuestionView(question(rs.getLong("question_id"), includeAnswers),
                rs.getInt("order_index"), rs.getBigDecimal("points")), quizId);
        return new QuizView(summary, items);
    }

    private QuizSummary summary(Long courseId, Long quizId) {
        return quizzes(courseId).stream().filter(q -> q.id().equals(quizId)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
    }

    private QuestionView question(Long id, boolean includeAnswers) {
        QuestionView base = jdbc.queryForObject("SELECT id, course_id, content, question_type FROM question_bank WHERE id = ?",
                (rs, row) -> new QuestionView(rs.getLong("id"), rs.getLong("course_id"),
                        rs.getString("content"), rs.getString("question_type"), List.of()), id);
        List<OptionView> options = jdbc.query("""
                SELECT id, content, is_correct, order_index FROM question_options
                WHERE question_id = ? ORDER BY order_index
                """, (rs, row) -> new OptionView(rs.getLong("id"), rs.getString("content"),
                includeAnswers ? rs.getBoolean("is_correct") : null, rs.getInt("order_index")), id);
        return new QuestionView(base.id(), base.courseId(), base.content(), base.type(), options);
    }

    private void requireQuestionCourse(Long courseId, Long questionId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM question_bank WHERE id = ? AND course_id = ?",
                Integer.class, questionId, courseId);
        if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Question not found in course");
    }

    private void validateQuestion(QuestionInput input) {
        if (!"SINGLE_CHOICE".equals(input.type())) badRequest("Unsupported question type");
        List<OptionInput> options = input.options() == null ? List.of() : input.options();
        if (options.size() < 2) badRequest("At least two options are required");
        long correct = options.stream().filter(OptionInput::correct).count();
        if (correct != 1) badRequest("Exactly one option must be correct");
        for (OptionInput option : options) if (option == null || option.content() == null
                || option.content().isBlank()) badRequest("Option content is required");
    }

    private void insertOptions(Long questionId, List<OptionInput> options) {
        if (options == null) return;
        for (int i = 0; i < options.size(); i++) {
            OptionInput option = options.get(i);
            jdbc.update("INSERT INTO question_options (question_id, content, is_correct, order_index) VALUES (?, ?, ?, ?)",
                    questionId, option.content().trim(), option.correct(), i);
        }
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

    private static void badRequest(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
