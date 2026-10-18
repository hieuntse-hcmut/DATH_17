package com.smartcampus.backend.notification.repository;

import com.smartcampus.backend.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDescIdDesc(Long recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDescIdDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadFalse(Long recipientId);

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    /** Marks one notification of this recipient as read; read_at is set by the database. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE notifications
            SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
            WHERE id = :id AND recipient_id = :recipientId AND is_read = FALSE
            """, nativeQuery = true)
    int markRead(@Param("id") Long id, @Param("recipientId") Long recipientId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE notifications
            SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
            WHERE recipient_id = :recipientId AND is_read = FALSE
            """, nativeQuery = true)
    int markAllRead(@Param("recipientId") Long recipientId);
}
