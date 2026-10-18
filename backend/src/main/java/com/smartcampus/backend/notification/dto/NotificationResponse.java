package com.smartcampus.backend.notification.dto;

import com.smartcampus.backend.notification.entity.Notification;
import com.smartcampus.backend.notification.entity.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "One in-app notification")
public record NotificationResponse(
        @Schema(example = "12") Long id,
        @Schema(example = "COURSE_COMPLETED") NotificationType type,
        @Schema(example = "Course completed") String title,
        @Schema(example = "You completed every lesson of \"Introduction to Spring Boot\".") String message,
        @Schema(description = "Frontend path to open, if any", example = "/courses/9101", nullable = true) String link,
        @Schema(example = "false") boolean read,
        @Schema(example = "2026-10-18T03:20:00") LocalDateTime createdAt,
        @Schema(nullable = true, example = "2026-10-18T03:25:00") LocalDateTime readAt
) {
    public static NotificationResponse of(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getMessage(), n.getLink(),
                n.isRead(), n.getCreatedAt(), n.getReadAt());
    }
}
