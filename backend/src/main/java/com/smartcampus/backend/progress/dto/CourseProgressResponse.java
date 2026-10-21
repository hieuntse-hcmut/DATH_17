package com.smartcampus.backend.progress.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "A student's progress in one course, with where to resume (UC-PROG-001)")
public record CourseProgressResponse(
        @Schema(example = "9101") Long courseId,
        @Schema(example = "Introduction to Spring Boot") String courseTitle,
        @Schema(example = "9001") Long studentId,
        @Schema(example = "3") long totalLessons,
        @Schema(example = "1") long completedLessons,
        @Schema(example = "33.3") double progressPercent,
        @Schema(example = "IN_PROGRESS") ProgressStatus status,
        @Schema(description = "Lesson to open on 'Continue learning': last accessed, else the first lesson",
                nullable = true, example = "9302") Long resumeLessonId,
        @Schema(nullable = true, example = "Your first REST API") String resumeLessonTitle,
        @Schema(description = "Position to resume at (seconds/pages)", example = "120") int resumePosition,
        List<LessonProgressItem> lessons
) {
}
