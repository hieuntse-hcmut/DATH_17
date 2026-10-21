package com.smartcampus.backend.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;

/** Maps table notifications (V3__create_notifications.sql). */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false, updatable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50, columnDefinition = "VARCHAR(50)", updatable = false)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 255, updatable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT", updatable = false)
    private String message;

    @Column(name = "link", length = 500, updatable = false)
    private String link;

    // read state is changed only through NotificationRepository.markRead/markAllRead
    @Column(name = "is_read", nullable = false, insertable = false, updatable = false)
    private boolean read;

    @Generated
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at", insertable = false, updatable = false)
    private LocalDateTime readAt;

    protected Notification() {
        // for JPA
    }

    public Notification(Long recipientId, NotificationType type, String title, String message, String link) {
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.link = link;
    }

    public Long getId() { return id; }
    public Long getRecipientId() { return recipientId; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getLink() { return link; }
    public boolean isRead() { return read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReadAt() { return readAt; }
}
