package com.smartcampus.backend.discussion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public final class DiscussionModels {
    private DiscussionModels() {}

    public record CommentInput(@NotBlank @Size(max = 5000) String content, @Positive Long parentId) {}
    public record EditInput(@NotBlank @Size(max = 5000) String content) {}
    public record CommentView(Long id, Long courseId, Long authorId, String authorName,
                              Long parentId, String content, boolean deleted,
                              LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
