package com.smartcampus.backend.assessment;

import com.smartcampus.backend.assessment.AssessmentModels.QuizView;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public final class AttemptModels {
    private AttemptModels() {}

    /** questionId -> id của option đã chọn */
    public record SubmitRequest(Map<Long, Long> answers) {}

    /** savedAnswers: questionId -> văn bản JSON của đáp án đã lưu (để tiếp tục làm dở). */
    public record AttemptStart(Long attemptId, int attemptNumber, Long remainingSeconds, QuizView quiz,
                               Map<Long, String> savedAnswers) {}

    public record AnswerResult(Long questionId, boolean correct, BigDecimal score) {}

    public record AttemptResult(Long attemptId, String status, BigDecimal score, BigDecimal totalPoints,
                                List<AnswerResult> answers) {}

    /** Một dòng trong lịch sử làm bài của sinh viên. */
    public record AttemptSummary(Long attemptId, Long quizId, int attemptNumber, String status,
                                 BigDecimal score, BigDecimal totalPoints,
                                 LocalDateTime startTime, LocalDateTime submitTime) {}
}