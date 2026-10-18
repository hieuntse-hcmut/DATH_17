package com.smartcampus.backend.progress.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/** Body of PUT /api/lessons/{lessonId}/progress. */
@Schema(description = "Position reached in a lesson: seconds for video, pages for PDF/slides")
public record UpdatePositionRequest(
        @Schema(description = "Furthest position reached (seconds or pages)", example = "540",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @PositiveOrZero Integer position,

        @Schema(description = "Total length (video duration in seconds or number of pages). "
                + "When given, the lesson is completed automatically at 90%.", example = "600", nullable = true)
        @Positive Integer totalLength
) {
}
