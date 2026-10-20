package com.smartcampus.backend.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class AssessmentModels {
    private AssessmentModels() {}

    public record OptionInput(@NotBlank String content, boolean correct) {}
    public record QuestionInput(@NotBlank String content, @NotBlank String type,
                                List<@NotNull @Valid OptionInput> options) {}
    public record OptionView(Long id, String content, Boolean correct, int orderIndex) {}
    public record QuestionView(Long id, Long courseId, String content, String type,
                               List<OptionView> options) {}
    public record QuizQuestionInput(@NotNull @Positive Long questionId,
                                    @NotNull @Positive BigDecimal points) {}
    public record QuizInput(@NotBlank @Size(max = 255) String title,
                            LocalDateTime startTime, LocalDateTime endTime,
                            @Positive Integer durationMinutes, @NotNull @Positive Integer maxAttempts,
                            @NotEmpty List<@NotNull @Valid QuizQuestionInput> questions) {}
    public record QuizSummary(Long id, Long courseId, String title, String status,
                              LocalDateTime startTime, LocalDateTime endTime,
                              Integer durationMinutes, int maxAttempts) {}
    public record QuizQuestionView(QuestionView question, int orderIndex, BigDecimal points) {}
    public record QuizView(QuizSummary quiz, List<QuizQuestionView> questions) {}
}
