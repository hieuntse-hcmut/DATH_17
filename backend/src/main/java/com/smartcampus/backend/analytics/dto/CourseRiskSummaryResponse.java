package com.smartcampus.backend.analytics.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thống kê tổng quan về điểm rủi ro của khóa học")
public record CourseRiskSummaryResponse(
        @Schema(example = "9101") Long courseId,
        @Schema(description = "Điểm rủi ro trung bình của khóa", example = "45.5") Double averageRiskScore,
        @Schema(description = "Số sinh viên có nguy cơ CAO", example = "5") int highRiskCount,
        @Schema(description = "Số sinh viên có nguy cơ TRUNG BÌNH", example = "10") int mediumRiskCount,
        @Schema(description = "Số sinh viên có nguy cơ THẤP", example = "25") int lowRiskCount
) {}