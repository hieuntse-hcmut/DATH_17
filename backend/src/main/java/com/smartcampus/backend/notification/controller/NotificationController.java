package com.smartcampus.backend.notification.controller;

import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import com.smartcampus.backend.notification.dto.MarkAllReadResponse;
import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.notification.dto.UnreadCountResponse;
import com.smartcampus.backend.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Notification", description = "In-app notifications of the logged-in user")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@RestController
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserResolver currentUserResolver;

    public NotificationController(NotificationService notificationService, CurrentUserResolver currentUserResolver) {
        this.notificationService = notificationService;
        this.currentUserResolver = currentUserResolver;
    }

    @Operation(summary = "List my notifications, newest first",
            description = "Any logged-in user. `unreadOnly=true` returns only unread ones. `limit` defaults to 20, max 100.")
    @GetMapping("/api/notifications/me")
    public ApiResponse<List<NotificationResponse>> getMyNotifications(
            @Parameter(example = "false") @RequestParam(name = "unreadOnly", defaultValue = "false") boolean unreadOnly,
            @Parameter(example = "20") @RequestParam(name = "limit", required = false) Integer limit) {
        Long userId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(notificationService.getMyNotifications(userId, unreadOnly, limit));
    }

    @Operation(summary = "Number of unread notifications (for the bell badge)")
    @GetMapping("/api/notifications/me/unread-count")
    public ApiResponse<UnreadCountResponse> countUnread() {
        return ApiResponse.ok(notificationService.countUnread(currentUserResolver.getCurrentUserId()));
    }

    @Operation(summary = "Mark one of my notifications as read",
            description = "404 NOTIFICATION_NOT_FOUND if it does not exist or belongs to another user.")
    @PatchMapping("/api/notifications/{notificationId}/read")
    public ApiResponse<NotificationResponse> markRead(
            @Parameter(example = "12") @PathVariable("notificationId") Long notificationId) {
        Long userId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(notificationService.markRead(userId, notificationId));
    }

    @Operation(summary = "Mark all my notifications as read")
    @PatchMapping("/api/notifications/me/read-all")
    public ApiResponse<MarkAllReadResponse> markAllRead() {
        return ApiResponse.ok(notificationService.markAllRead(currentUserResolver.getCurrentUserId()));
    }
}
