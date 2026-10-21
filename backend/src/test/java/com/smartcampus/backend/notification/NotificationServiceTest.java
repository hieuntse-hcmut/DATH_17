package com.smartcampus.backend.notification;

import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.notification.dto.NotificationResponse;
import com.smartcampus.backend.notification.entity.Notification;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.repository.NotificationRepository;
import com.smartcampus.backend.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private static final Long USER_ID = 1L;

    @Mock private NotificationRepository repository;
    @InjectMocks private NotificationService service;

    @Test
    void notify_savesNotificationForRecipient() {
        when(repository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        service.notify(USER_ID, NotificationType.SYSTEM, "Title", "Message", "/x");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(repository).save(captor.capture());
        assertEquals(USER_ID, captor.getValue().getRecipientId());
        assertEquals(NotificationType.SYSTEM, captor.getValue().getType());
        assertEquals("/x", captor.getValue().getLink());
    }

    @Test
    void getMyNotifications_usesDefaultAndMaxLimit() {
        when(repository.findByRecipientIdOrderByCreatedAtDescIdDesc(USER_ID, PageRequest.of(0, 20))).thenReturn(List.of());
        when(repository.findByRecipientIdAndReadFalseOrderByCreatedAtDescIdDesc(USER_ID, PageRequest.of(0, 100))).thenReturn(List.of());

        assertTrue(service.getMyNotifications(USER_ID, false, null).isEmpty());
        assertTrue(service.getMyNotifications(USER_ID, true, 5000).isEmpty());
    }

    @Test
    void markRead_ownNotification_returnsItAsRead() {
        Notification unread = notification(7L);
        Notification read = notification(7L);
        ReflectionTestUtils.setField(read, "read", true);
        when(repository.findByIdAndRecipientId(7L, USER_ID)).thenReturn(Optional.of(unread), Optional.of(read));

        NotificationResponse response = service.markRead(USER_ID, 7L);

        assertTrue(response.read());
        verify(repository).markRead(7L, USER_ID);
    }

    @Test
    void markRead_notificationOfAnotherUser_isRejectedWith404() {
        when(repository.findByIdAndRecipientId(7L, USER_ID)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.markRead(USER_ID, 7L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("NOTIFICATION_NOT_FOUND", ex.getCode());
        verify(repository, never()).markRead(anyLong(), anyLong());
    }

    @Test
    void markAllRead_returnsNumberOfUpdatedRows() {
        when(repository.markAllRead(USER_ID)).thenReturn(3);

        assertEquals(3, service.markAllRead(USER_ID).marked());
    }

    @Test
    void countUnread_delegatesToRepository() {
        when(repository.countByRecipientIdAndReadFalse(USER_ID)).thenReturn(4L);

        assertEquals(4L, service.countUnread(USER_ID).unread());
    }

    private static Notification notification(Long id) {
        Notification n = new Notification(USER_ID, NotificationType.SYSTEM, "t", "m", null);
        ReflectionTestUtils.setField(n, "id", id);
        return n;
    }
}
