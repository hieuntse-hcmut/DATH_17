package com.smartcampus.backend.progress;

import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import com.smartcampus.backend.progress.dto.CourseProgressResponse;
import com.smartcampus.backend.progress.dto.LessonProgressResponse;
import com.smartcampus.backend.progress.dto.ProgressStatus;
import com.smartcampus.backend.progress.dto.UpdatePositionRequest;
import com.smartcampus.backend.progress.entity.LearningActivity;
import com.smartcampus.backend.progress.entity.LearningEventType;
import com.smartcampus.backend.progress.entity.LearningProgress;
import com.smartcampus.backend.progress.repository.LearningActivityRepository;
import com.smartcampus.backend.progress.repository.LearningProgressRepository;
import com.smartcampus.backend.progress.repository.projection.LessonContextView;
import com.smartcampus.backend.progress.repository.projection.LessonProgressView;
import com.smartcampus.backend.progress.service.LearningProgressService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.smartcampus.backend.support.TestData.lecturer;
import static com.smartcampus.backend.support.TestData.student;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LearningProgressServiceTest {

    private static final Long STUDENT_ID = 1L;
    private static final Long COURSE_ID = 10L;
    private static final Long LESSON_ID = 30L;

    @Mock private LearningProgressRepository progressRepository;
    @Mock private LearningActivityRepository activityRepository;
    @Mock private CourseAccessGuard courseAccessGuard;
    @Mock private NotificationService notificationService;
    @InjectMocks private LearningProgressService service;

    // ======================================================== mark complete

    @Test
    void markComplete_firstTime_logsActivity_noCourseNotificationWhileLessonsRemain() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(true, 0)));
        givenCounts(3, 1);

        LessonProgressResponse response = service.markLessonComplete(STUDENT_ID, LESSON_ID);

        assertTrue(response.completed());
        assertEquals(33.3, response.courseProgressPercent());
        verify(progressRepository).upsertCompleted(STUDENT_ID, LESSON_ID);
        assertEquals(LearningEventType.LESSON_COMPLETED, savedActivities().getFirst().getEventType());
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    @Test
    void markComplete_lastLesson_sendsCourseCompletedNotification() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(true, 0)));
        givenCounts(3, 3);

        LessonProgressResponse response = service.markLessonComplete(STUDENT_ID, LESSON_ID);

        assertEquals(100.0, response.courseProgressPercent());
        verify(notificationService).notify(eq(STUDENT_ID), eq(NotificationType.COURSE_COMPLETED),
                anyString(), anyString(), eq("/courses/10"));
    }

    @Test
    void markComplete_alreadyCompleted_isIdempotent() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.of(progress(true, 0)));
        givenCounts(3, 3);

        service.markLessonComplete(STUDENT_ID, LESSON_ID);

        verify(activityRepository, never()).save(any());
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    // ======================================================= update position

    @Test
    void updatePosition_below90Percent_savesPositionWithoutCompleting() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(false, 300)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(0L);
        givenCounts(3, 0);

        LessonProgressResponse response = service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(300, 600));

        assertFalse(response.completed());
        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 300, false);
        List<LearningActivity> saved = savedActivities();
        assertEquals(1, saved.size());
        assertEquals(LearningEventType.LESSON_PROGRESS, saved.getFirst().getEventType());
        assertEquals(300, saved.getFirst().getCurrentPosition());
    }

    @Test
    void updatePosition_reaches90Percent_completesLesson() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(true, 540)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(0L);
        givenCounts(3, 1);

        LessonProgressResponse response = service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(540, 600));

        assertTrue(response.completed());
        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 540, true);
        List<LearningActivity> saved = savedActivities();
        assertEquals(List.of(LearningEventType.LESSON_PROGRESS, LearningEventType.LESSON_COMPLETED),
                saved.stream().map(LearningActivity::getEventType).toList());
    }

    @Test
    void updatePosition_positionGreaterThanLength_isClamped() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.of(progress(true, 600)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 1);

        service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(9999, 600));

        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 600, true);
    }

    @Test
    void updatePosition_withinThrottleWindow_doesNotLogProgressEvent() {
        givenLessonAccess("PUBLISHED");
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.of(progress(false, 100)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 0);

        service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(120, null));

        verify(activityRepository, never()).save(any());
        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 120, false);
    }

    /** V5: totalLength client gửi lên bị bỏ qua; {"position":1,"totalLength":1} không làm bài hoàn thành. */
    @Test
    void updatePosition_ignoresClientTotalLength_usesLessonLength() {
        givenLessonAccess("PUBLISHED", "VIDEO", 600);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(false, 1)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 0);

        LessonProgressResponse response = service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(1, 1));

        assertFalse(response.completed());
        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 1, false);
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    /** V5: bài chưa có total_length và client không gửi length thì chỉ lưu vị trí, không bao giờ tự hoàn thành. */
    @Test
    void updatePosition_lessonWithoutLength_savesPositionButNeverCompletes() {
        givenLessonAccess("PUBLISHED", "VIDEO", null);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(false, 5000)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 0);

        service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(5000, null));

        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 5000, false);
        verify(activityRepository, never()).save(any());
    }

    /** Tự động cập nhật total_length khi bài học chưa có (ví dụ video YouTube) và tự hoàn thành khi đạt >= 90%. */
    @Test
    void updatePosition_lessonWithoutLength_autoPopulatesLengthFromClientAndCompletes() {
        givenLessonAccess("PUBLISHED", "VIDEO", null);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(true, 540)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 1);

        LessonProgressResponse response = service.updatePosition(STUDENT_ID, LESSON_ID, new UpdatePositionRequest(540, 600));

        verify(progressRepository).updateTotalLengthIfEmpty(LESSON_ID, 600);
        verify(progressRepository).upsertPosition(STUDENT_ID, LESSON_ID, 540, true);
        assertTrue(response.completed());
    }

    @Test
    void markComplete_videoLesson_isRejected() {
        givenLessonAccess("PUBLISHED", "VIDEO", 600);

        ApiException ex = assertThrows(ApiException.class, () -> service.markLessonComplete(STUDENT_ID, LESSON_ID));

        assertEquals("MANUAL_COMPLETION_NOT_ALLOWED", ex.getCode());
        verify(progressRepository, never()).upsertCompleted(any(), any());
    }

    @Test
    void threshold_is90Percent() {
        assertTrue(invokeThreshold(540, 600));
        assertFalse(invokeThreshold(539, 600));
        assertFalse(invokeThreshold(10, null));
    }

    // ================================================================ access

    @Test
    void lessonAccess_lecturer_isRejected() {
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(lecturer(STUDENT_ID));

        ApiException ex = assertThrows(ApiException.class, () -> service.markLessonComplete(STUDENT_ID, LESSON_ID));

        assertEquals("NOT_A_STUDENT", ex.getCode());
    }

    @Test
    void lessonAccess_unknownLesson_isRejectedWith404() {
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(student(STUDENT_ID));
        when(progressRepository.findLessonContext(LESSON_ID)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.markLessonComplete(STUDENT_ID, LESSON_ID));

        assertEquals("LESSON_NOT_FOUND", ex.getCode());
    }

    @Test
    void lessonAccess_notEnrolled_isRejectedWith403() {
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(student(STUDENT_ID));
        when(progressRepository.findLessonContext(LESSON_ID)).thenReturn(Optional.of(lesson("PUBLISHED")));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(0L);

        ApiException ex = assertThrows(ApiException.class, () -> service.markLessonComplete(STUDENT_ID, LESSON_ID));

        assertEquals("NOT_ENROLLED", ex.getCode());
        verify(progressRepository, never()).upsertCompleted(any(), any());
    }

    @Test
    void lessonAccess_unpublishedCourse_isRejectedWith403() {
        givenLessonAccess("DRAFT");

        ApiException ex = assertThrows(ApiException.class, () -> service.markLessonComplete(STUDENT_ID, LESSON_ID));

        assertEquals("COURSE_NOT_PUBLISHED", ex.getCode());
    }

    // ====================================================== course progress

    @Test
    void getMyCourseProgress_resumesAtMostRecentlyAccessedLesson() {
        when(progressRepository.findCourseTitle(COURSE_ID)).thenReturn(Optional.of("Spring Boot 101"));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(1L);
        LocalDateTime older = LocalDateTime.of(2026, 10, 17, 8, 0);
        LocalDateTime newer = LocalDateTime.of(2026, 10, 18, 8, 0);
        when(progressRepository.findLessonsWithProgress(STUDENT_ID, COURSE_ID)).thenReturn(List.of(
                lessonRow(31L, 1L, 600, older),
                lessonRow(32L, 0L, 120, newer),
                lessonRow(33L, 0L, null, null)));

        CourseProgressResponse response = service.getMyCourseProgress(STUDENT_ID, COURSE_ID);

        assertEquals(3, response.totalLessons());
        assertEquals(1, response.completedLessons());
        assertEquals(33.3, response.progressPercent());
        assertEquals(ProgressStatus.IN_PROGRESS, response.status());
        assertEquals(32L, response.resumeLessonId());
        assertEquals(120, response.resumePosition());
    }

    @Test
    void getMyCourseProgress_noProgress_resumesAtFirstLesson() {
        when(progressRepository.findCourseTitle(COURSE_ID)).thenReturn(Optional.of("Spring Boot 101"));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(1L);
        when(progressRepository.findLessonsWithProgress(STUDENT_ID, COURSE_ID)).thenReturn(List.of(
                lessonRow(31L, 0L, null, null), lessonRow(32L, 0L, null, null)));

        CourseProgressResponse response = service.getMyCourseProgress(STUDENT_ID, COURSE_ID);

        assertEquals(ProgressStatus.NOT_STARTED, response.status());
        assertEquals(31L, response.resumeLessonId());
        assertEquals(0, response.resumePosition());
    }

    @Test
    void getMyCourseProgress_notEnrolled_isRejectedWith403() {
        when(progressRepository.findCourseTitle(COURSE_ID)).thenReturn(Optional.of("Spring Boot 101"));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(0L);

        ApiException ex = assertThrows(ApiException.class, () -> service.getMyCourseProgress(STUDENT_ID, COURSE_ID));

        assertEquals("NOT_ENROLLED", ex.getCode());
    }

    @Test
    void progressStatus_and_percent() {
        assertEquals(ProgressStatus.COMPLETED, ProgressStatus.of(3, 3, true));
        assertEquals(ProgressStatus.NOT_STARTED, ProgressStatus.of(0, 3, false));
        assertEquals(ProgressStatus.IN_PROGRESS, ProgressStatus.of(0, 3, true));
        assertEquals(ProgressStatus.NOT_STARTED, ProgressStatus.of(0, 0, false));
        assertEquals(0.0, ProgressStatus.percent(0, 0));
        assertEquals(66.7, ProgressStatus.percent(2, 3));
    }

    // =============================================================== helpers

    private void givenLessonAccess(String publicationState) {
        givenLessonAccess(publicationState, "TEXT", 600);
    }

    private void givenLessonAccess(String publicationState, String contentType, Integer totalLength) {
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(student(STUDENT_ID));
        when(progressRepository.findLessonContext(LESSON_ID))
                .thenReturn(Optional.of(lesson(publicationState, contentType, totalLength)));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(1L);
    }

    private void givenCounts(long total, long completed) {
        when(progressRepository.countLessonsOfCourse(COURSE_ID)).thenReturn(total);
        when(progressRepository.countCompletedLessons(STUDENT_ID, COURSE_ID)).thenReturn(completed);
    }

    private List<LearningActivity> savedActivities() {
        ArgumentCaptor<LearningActivity> captor = ArgumentCaptor.forClass(LearningActivity.class);
        verify(activityRepository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
        return captor.getAllValues();
    }

    private static boolean invokeThreshold(int position, Integer total) {
        return (boolean) ReflectionTestUtils.invokeMethod(LearningProgressService.class, "reachesThreshold", position, total);
    }

    private static LearningProgress progress(boolean completed, int position) {
        try {
            Constructor<LearningProgress> ctor = LearningProgress.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            LearningProgress p = ctor.newInstance();
            ReflectionTestUtils.setField(p, "completed", completed);
            ReflectionTestUtils.setField(p, "lastPosition", position);
            return p;
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }

    private static LessonContextView lesson(String publicationState) {
        return lesson(publicationState, "TEXT", 600);
    }

    /** totalLength = lessons.total_length (V5); 600 cho khớp các test cũ dùng video 600 giây. */
    private static LessonContextView lesson(String publicationState, String contentType, Integer totalLength) {
        return new LessonContextView() {
            @Override public Long getLessonId() { return LESSON_ID; }
            @Override public String getLessonTitle() { return "Lesson"; }
            @Override public Long getCourseId() { return COURSE_ID; }
            @Override public String getCourseTitle() { return "Spring Boot 101"; }
            @Override public String getPublicationState() { return publicationState; }
            @Override public Integer getTotalLength() { return totalLength; }
        };
    }

    private static LessonProgressView lessonRow(Long lessonId, Long completed, Integer position, LocalDateTime accessedAt) {
        return new LessonProgressView() {
            @Override public Long getLessonId() { return lessonId; }
            @Override public String getLessonTitle() { return "Lesson " + lessonId; }
            @Override public Long getChapterId() { return 1L; }
            @Override public String getChapterTitle() { return "Chapter"; }
            @Override public Long getCompleted() { return completed; }
            @Override public Integer getLastPosition() { return position; }
            @Override public LocalDateTime getLastAccessedAt() { return accessedAt; }
        };
    }
}

