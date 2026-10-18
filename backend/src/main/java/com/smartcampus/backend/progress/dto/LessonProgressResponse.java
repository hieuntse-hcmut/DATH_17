package com.smartcampus.backend.progress.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Progress of one lesson after an update, with the course progress bar")
public record LessonProgressResponse(
        @Schema(example = "9301") Long lessonId,
        @Schema(example = "9101") Long courseId,
        @Schema(example = "true") boolean completed,
        @Schema(description = "Resume position (seconds/pages)", example = "540") int lastPosition,
        @Schema(example = "2") long courseCompletedLessons,
        @Schema(example = "3") long courseTotalLessons,
        @Schema(example = "66.7") double courseProgressPercent
) {
}
