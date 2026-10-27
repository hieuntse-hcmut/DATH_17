package com.smartcampus.backend.analytics.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Thông tin chi tiết về điểm rủi ro của từng sinh viên")
public record StudentRiskResponse(
        @Schema(example = "9001") Long studentId,
        @Schema(example = "student_a") String username,
        @Schema(example = "Test Student A") String fullName,
        @Schema(example = "student.a@test.local") String email,
        @Schema(description = "Điểm rủi ro (0 - 100)", example = "75.5") Double riskScore,
        @Schema(description = "Mức độ rủi ro (LOW, MEDIUM, HIGH)", example = "HIGH") String riskLevel,
        @Schema(description = "Thời gian đánh giá gần nhất", example = "2026-10-26T20:00:00") LocalDateTime assessedAt
) {}