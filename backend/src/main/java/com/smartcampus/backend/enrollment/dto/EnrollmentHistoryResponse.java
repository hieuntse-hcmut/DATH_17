package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "One status transition of an enrollment (append-only)")
public record EnrollmentHistoryResponse(
        @Schema(description = "null for the first entry", example = "ACTIVE", nullable = true) EnrollmentStatus previousStatus,
        @Schema(example = "WITHDRAWN") EnrollmentStatus newStatus,
        @Schema(description = "User who made the change", example = "9001") Long changedBy,
        @Schema(example = "Student withdrawal", nullable = true) String reason,
        @Schema(example = "2026-10-18T03:15:00") LocalDateTime changedAt
) {
    public static EnrollmentHistoryResponse of(EnrollmentHistory h) {
        return new EnrollmentHistoryResponse(h.getPreviousStatus(), h.getNewStatus(), h.getChangedBy(),
                h.getReason(), h.getCreatedAt());
    }
}
