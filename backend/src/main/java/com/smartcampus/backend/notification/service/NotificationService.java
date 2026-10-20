package com.smartcampus.backend.notification.service;

import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.notification.dto.MarkAllReadResponse;
import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.notification.dto.UnreadCountResponse;
import com.smartcampus.backend.notification.entity.Notification;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.repository.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * In-app notifications (FR-INT-005/006/008).
 *
 * Other modules send a notification with:
 * <pre>
 *   notificationService.notify(userId, NotificationType.NEW_CONTENT,
 *           "New lesson", "Lesson 3 was published", "/courses/9101/lessons/3");
 * </pre>
 * The notification is saved in the caller's transaction, so it disappears if that transaction rolls back.
 */
@Service
public class NotificationService {

    static final int DEFAULT_LIMIT = 20;
    static final int MAX_LIMIT = 100;

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification notify(Long recipientId, NotificationType type, String title, String message, String link) {
        return notificationRepository.save(new Notification(recipientId, type, title, message, link));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Long userId, boolean unreadOnly, Integer limit) {
        PageRequest page = PageRequest.of(0, normalizeLimit(limit));
        List<Notification> rows = unreadOnly
                ? notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDescIdDesc(userId, page)
                : notificationRepository.findByRecipientIdOrderByCreatedAtDescIdDesc(userId, page);
        return rows.stream().map(NotificationResponse::of).toList();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse countUnread(Long userId) {
        return new UnreadCountResponse(notificationRepository.countByRecipientIdAndReadFalse(userId));
    }

    /** Idempotent: marking an already-read notification returns it unchanged. */
    @Transactional
    public NotificationResponse markRead(Long userId, Long notificationId) {
        notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> ApiException.notFound("NOTIFICATION_NOT_FOUND",
                        "Notification " + notificationId + " does not exist"));
        notificationRepository.markRead(notificationId, userId);
        return notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .map(NotificationResponse::of)
                .orElseThrow();
    }

    @Transactional
    public MarkAllReadResponse markAllRead(Long userId) {
        return new MarkAllReadResponse(notificationRepository.markAllRead(userId));
    }

    static int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
