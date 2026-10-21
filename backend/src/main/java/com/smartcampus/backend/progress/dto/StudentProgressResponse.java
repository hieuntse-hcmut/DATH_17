package com.smartcampus.backend.progress.dto;

import com.smartcampus.backend.progress.repository.projection.StudentProgressView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "One student's progress in a course (lecturer view)")
public record StudentProgressResponse(
        @Schema(example = "9001") Long studentId,
        @Schema(example = "student_a") String username,
        @Schema(example = "Test Student A") String fullName,
        @Schema(example = "1") long completedLessons,
        @Schema(example = "3") long totalLessons,
        @Schema(example = "33.3") double progressPercent,
        @Schema(example = "IN_PROGRESS") ProgressStatus status,
        @Schema(nullable = true, example = "2026-10-18T03:20:00") LocalDateTime lastAccessedAt
) {
    public static StudentProgressResponse of(StudentProgressView v, long totalLessons) {
        long done = v.getCompletedLessons() == null ? 0 : v.getCompletedLessons();
        return new StudentProgressResponse(v.getStudentId(), v.getUsername(), v.getFullName(), done, totalLessons,
                ProgressStatus.percent(done, totalLessons),
                ProgressStatus.of(done, totalLessons, v.getLastAccessedAt() != null),
                v.getLastAccessedAt());
    }
}
