package com.smartcampus.backend.progress.dto;

import com.smartcampus.backend.progress.repository.projection.MyCourseProgressView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "One enrolled course on the 'My Courses' page")
public record MyCourseProgressResponse(
        @Schema(example = "9101") Long courseId,
        @Schema(example = "Introduction to Spring Boot") String courseTitle,
        @Schema(description = "Full name of the course creator", example = "Test Lecturer A") String instructorName,
        @Schema(example = "3") long totalLessons,
        @Schema(example = "1") long completedLessons,
        @Schema(example = "33.3") double progressPercent,
        @Schema(example = "IN_PROGRESS") ProgressStatus status,
        @Schema(example = "2026-10-10T05:36:02") LocalDateTime enrolledAt,
        @Schema(nullable = true, example = "2026-10-18T03:20:00") LocalDateTime lastAccessedAt,
        @Schema(nullable = true, example = "9302") Long lastLessonId,
        @Schema(nullable = true, example = "Your first REST API") String lastLessonTitle
) {
    public static MyCourseProgressResponse of(MyCourseProgressView v) {
        long total = v.getTotalLessons() == null ? 0 : v.getTotalLessons();
        long done = v.getCompletedLessons() == null ? 0 : v.getCompletedLessons();
        return new MyCourseProgressResponse(v.getCourseId(), v.getCourseTitle(), v.getInstructorName(),
                total, done, ProgressStatus.percent(done, total),
                ProgressStatus.of(done, total, v.getLastAccessedAt() != null),
                v.getEnrolledAt(), v.getLastAccessedAt(), v.getLastLessonId(), v.getLastLessonTitle());
    }
}
