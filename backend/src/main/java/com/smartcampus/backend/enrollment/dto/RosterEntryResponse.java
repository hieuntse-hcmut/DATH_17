package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.repository.projection.RosterEntryView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "One student in a course roster")
public record RosterEntryResponse(
        @Schema(example = "1") Long enrollmentId,
        @Schema(example = "9001") Long studentId,
        @Schema(example = "student_a") String username,
        @Schema(example = "Test Student A") String fullName,
        @Schema(example = "student.a@test.local") String email,
        @Schema(description = "Account status (ACTIVE/INACTIVE), shown so the lecturer sees an ACTIVE enrollee who cannot sign in",
                example = "ACTIVE") String accountStatus,
        @Schema(example = "ACTIVE") EnrollmentStatus status,
        @Schema(example = "2026-10-10T05:36:02") LocalDateTime enrolledAt,
        @Schema(description = "Latest status change", example = "2026-10-10T05:36:02") LocalDateTime statusChangedAt
) {
    public static RosterEntryResponse of(RosterEntryView v) {
        return new RosterEntryResponse(v.getEnrollmentId(), v.getStudentId(), v.getUsername(), v.getFullName(),
                v.getEmail(), v.getAccountStatus(), EnrollmentStatus.valueOf(v.getStatus()),
                v.getEnrolledAt(), v.getStatusChangedAt());
    }
}
