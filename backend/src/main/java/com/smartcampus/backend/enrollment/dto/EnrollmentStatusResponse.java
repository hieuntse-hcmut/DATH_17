package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/** Result of a status change: withdraw, remove. */
@Schema(description = "Enrollment after a status change")
public record EnrollmentStatusResponse(
        @Schema(example = "1") Long enrollmentId,
        @Schema(example = "9001") Long studentId,
        @Schema(example = "9101") Long courseId,
        @Schema(description = "ACTIVE, WITHDRAWN or REMOVED", example = "WITHDRAWN") EnrollmentStatus status,
        @Schema(description = "When the status last changed (set by the database)", example = "2026-10-18T03:15:00")
        LocalDateTime statusChangedAt
) {
    public static EnrollmentStatusResponse of(Enrollment enrollment) {
        return new EnrollmentStatusResponse(enrollment.getId(), enrollment.getStudentId(),
                enrollment.getCourseId(), enrollment.getStatus(), enrollment.getUpdatedAt());
    }
}
