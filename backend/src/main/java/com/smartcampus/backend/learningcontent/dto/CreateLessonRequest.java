package com.smartcampus.backend.learningcontent.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * @param totalLength tuỳ chọn: tổng số giây (VIDEO) hoặc số trang (PDF); bỏ trống với TEXT.
 *                    Thiếu thì bài VIDEO/PDF không tự hoàn thành được.
 */
public record CreateLessonRequest(
        @NotBlank String title,
        @NotBlank String contentType,
        @Min(0) int orderIndex,
        @Positive Integer totalLength
) {}
