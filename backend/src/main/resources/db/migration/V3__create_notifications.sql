-- V3__create_notifications.sql
-- Owner: Notification module (in-app notifications, docs/01-requirements/06-interaction-notification.md)
--
-- type is VARCHAR without a CHECK so other modules can add notification types
-- (NEW_CONTENT, DEADLINE, GRADED, FORUM_REPLY, ...) without a new migration.
-- The vocabulary is defined centrally in NotificationType.java.


CREATE TABLE notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT       NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    title        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    link         VARCHAR(500) NULL,
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at      TIMESTAMP    NULL,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(id)
            ON DELETE RESTRICT ON UPDATE RESTRICT,

    INDEX idx_notifications_recipient_read_created (recipient_id, is_read, created_at)
);
