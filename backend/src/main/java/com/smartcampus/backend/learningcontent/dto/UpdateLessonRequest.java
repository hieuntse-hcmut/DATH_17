package com.smartcampus.backend.learningcontent.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * Thay toàn bộ thông tin bài học (PUT): gửi totalLength = null là xoá độ dài.
 *
 * @param totalLength tổng số giây (VIDEO) hoặc số trang (PDF); bỏ trống với TEXT.
 */
public record UpdateLessonRequest(
        @NotBlank String title,
        @Min(0) int orderIndex,
        @Positive Integer totalLength
) {}
