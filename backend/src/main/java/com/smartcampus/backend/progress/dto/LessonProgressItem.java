package com.smartcampus.backend.progress.dto;

import com.smartcampus.backend.progress.repository.projection.LessonProgressView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "One lesson of a course with the student's progress")
public record LessonProgressItem(
        @Schema(example = "9301") Long lessonId,
        @Schema(example = "Spring Boot overview") String lessonTitle,
        @Schema(example = "9201") Long chapterId,
        @Schema(example = "Getting started") String chapterTitle,
        @Schema(example = "true") boolean completed,
        @Schema(description = "Resume position; 0 when not started", example = "540") int lastPosition,
        @Schema(nullable = true, example = "2026-10-18T03:20:00") LocalDateTime lastAccessedAt
) {
    public static LessonProgressItem of(LessonProgressView v) {
        return new LessonProgressItem(v.getLessonId(), v.getLessonTitle(),
                v.getChapterId(), v.getChapterTitle(),
                v.getCompleted() != null && v.getCompleted() == 1L,
                v.getLastPosition() == null ? 0 : v.getLastPosition(),
                v.getLastAccessedAt());
    }
}
