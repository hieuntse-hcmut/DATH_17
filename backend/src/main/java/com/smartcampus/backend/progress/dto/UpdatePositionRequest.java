package com.smartcampus.backend.progress.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Body of PUT /api/lessons/{lessonId}/progress.
 * Từ V5 độ dài bài học lấy từ lessons.total_length; totalLength client gửi lên bị bỏ qua
 * (giữ field để FE cũ không lỗi khi gửi kèm).
 */
@Schema(description = "Position reached in a lesson: seconds for video, pages for PDF/slides")
public record UpdatePositionRequest(
        @Schema(description = "Furthest position reached (seconds or pages)", example = "540",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @PositiveOrZero Integer position,

        @Schema(description = "IGNORED since V5: the server uses the lesson's own total_length.",
                deprecated = true, nullable = true)
        Integer totalLength
) {
}

