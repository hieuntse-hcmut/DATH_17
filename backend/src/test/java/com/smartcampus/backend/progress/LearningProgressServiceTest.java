package com.smartcampus.backend.progress;

import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.learningcontent.entity.LearningMaterial;
import com.smartcampus.backend.learningcontent.repository.LearningMaterialRepository;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import com.smartcampus.backend.progress.dto.*;
import com.smartcampus.backend.progress.entity.*;
import com.smartcampus.backend.progress.repository.*;
import com.smartcampus.backend.progress.repository.projection.*;
import com.smartcampus.backend.progress.service.LearningProgressService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static com.smartcampus.backend.support.TestData.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningProgressServiceTest {
    private static final Long STUDENT_ID = 1L;
    private static final Long COURSE_ID = 10L;
    private static final Long LESSON_ID = 30L;
    private static final Long MATERIAL_ID = 40L;

    @Mock private LearningProgressRepository progressRepository;
    @Mock private LearningMaterialProgressRepository materialProgressRepository;
    @Mock private LearningMaterialRepository materialRepository;
    @Mock private LearningActivityRepository activityRepository;
    @Mock private CourseAccessGuard courseAccessGuard;
    @Mock private NotificationService notificationService;
    @InjectMocks private LearningProgressService service;

    @Test
    void video_below90Percent_doesNotCompleteLesson() {
        givenMaterial("VIDEO", 600);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(1L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(false, 0)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 0);

        LessonProgressResponse response = service.updateMaterialPosition(STUDENT_ID, MATERIAL_ID,
                new UpdatePositionRequest(539, 1));

        assertFalse(response.completed());
        verify(materialProgressRepository).upsert(STUDENT_ID, MATERIAL_ID, 539, false);
        verify(progressRepository).setLessonCompletion(STUDENT_ID, LESSON_ID, false);
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    @Test
    void video_reaches90Percent_completesLesson() {
        givenMaterial("VIDEO", 600);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(0L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.empty(), Optional.of(progress(true, 0)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 1);

        LessonProgressResponse response = service.updateMaterialPosition(STUDENT_ID, MATERIAL_ID,
                new UpdatePositionRequest(540, 1));

        assertTrue(response.completed());
        verify(materialProgressRepository).upsert(STUDENT_ID, MATERIAL_ID, 540, true);
        verify(progressRepository).setLessonCompletion(STUDENT_ID, LESSON_ID, true);
        verify(activityRepository).save(argThat(a -> a.getEventType() == LearningEventType.LESSON_COMPLETED));
    }

    @Test
    void video_positionIsClampedToServerLength() {
        givenMaterial("VIDEO", 600);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(1L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.of(progress(false, 0)), Optional.of(progress(false, 0)));
        when(activityRepository.countRecentEvents(STUDENT_ID, LESSON_ID, "LESSON_PROGRESS")).thenReturn(1L);
        givenCounts(3, 0);

        service.updateMaterialPosition(STUDENT_ID, MATERIAL_ID, new UpdatePositionRequest(9999, 1));

        verify(materialProgressRepository).upsert(STUDENT_ID, MATERIAL_ID, 600, true);
    }

    @Test
    void video_negativePosition_isRejected() {
        givenMaterial("VIDEO", 600);
        givenLessonAccess("PUBLISHED");
        ApiException ex = assertThrows(ApiException.class,
                () -> service.updateMaterialPosition(STUDENT_ID, MATERIAL_ID, new UpdatePositionRequest(-1, 1)));
        assertEquals("INVALID_POSITION", ex.getCode());
        verify(materialProgressRepository, never()).upsert(any(), any(), anyInt(), anyBoolean());
    }

    @Test
    void pdf_download_marksMaterialCompleted() {
        givenMaterial("PDF", null);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(0L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID)).thenReturn(Optional.empty());
        givenCounts(3, 1);

        String url = service.accessMaterial(STUDENT_ID, MATERIAL_ID, false);

        assertEquals("https://example.com/file", url);
        verify(materialProgressRepository).upsert(STUDENT_ID, MATERIAL_ID, 0, true);
        verify(progressRepository).setLessonCompletion(STUDENT_ID, LESSON_ID, true);
    }

    @Test
    void link_open_marksMaterialCompleted() {
        givenMaterial("LINK", null);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(0L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID)).thenReturn(Optional.empty());
        givenCounts(3, 1);

        service.accessMaterial(STUDENT_ID, MATERIAL_ID, true);

        verify(materialProgressRepository).upsert(STUDENT_ID, MATERIAL_ID, 0, true);
    }

    @Test
    void link_download_isRejected() {
        givenMaterial("LINK", null);
        givenLessonAccess("PUBLISHED");
        ApiException ex = assertThrows(ApiException.class,
                () -> service.accessMaterial(STUDENT_ID, MATERIAL_ID, false));
        assertEquals("INVALID_MATERIAL_ACTION", ex.getCode());
    }

    @Test
    void completedLesson_sendsCourseNotificationOnlyWhenLastLesson() {
        givenMaterial("PDF", null);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(0L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID)).thenReturn(Optional.empty());
        givenCounts(3, 3);

        service.accessMaterial(STUDENT_ID, MATERIAL_ID, false);

        verify(notificationService).notify(eq(STUDENT_ID), eq(NotificationType.COURSE_COMPLETED),
                anyString(), anyString(), eq("/courses/10"));
    }

    @Test
    void alreadyCompletedLesson_doesNotNotifyAgain() {
        givenMaterial("PDF", null);
        givenLessonAccess("PUBLISHED");
        when(materialProgressRepository.countMaterials(LESSON_ID)).thenReturn(1L);
        when(materialProgressRepository.countIncompleteMaterials(STUDENT_ID, LESSON_ID)).thenReturn(0L);
        when(progressRepository.findByStudentIdAndLessonId(STUDENT_ID, LESSON_ID))
                .thenReturn(Optional.of(progress(true, 0)));

        service.accessMaterial(STUDENT_ID, MATERIAL_ID, false);

        verify(activityRepository, never()).save(any());
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    @Test
    void lecturer_cannotUpdateMaterialProgress() {
        givenMaterial("VIDEO", 600);
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(lecturer(STUDENT_ID));
        ApiException ex = assertThrows(ApiException.class,
                () -> service.updateMaterialPosition(STUDENT_ID, MATERIAL_ID, new UpdatePositionRequest(100, null)));
        assertEquals("NOT_A_STUDENT", ex.getCode());
    }

    @Test
    void unknownMaterial_isRejected() {
        when(materialRepository.findById(MATERIAL_ID)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class,
                () -> service.accessMaterial(STUDENT_ID, MATERIAL_ID, false));
        assertEquals("MATERIAL_NOT_FOUND", ex.getCode());
    }

    @Test
    void notEnrolled_isRejected() {
        givenMaterial("PDF", null);
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(student(STUDENT_ID));
        when(progressRepository.findLessonContext(LESSON_ID)).thenReturn(Optional.of(lesson("PUBLISHED")));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(0L);
        ApiException ex = assertThrows(ApiException.class,
                () -> service.accessMaterial(STUDENT_ID, MATERIAL_ID, false));
        assertEquals("NOT_ENROLLED", ex.getCode());
    }

    @Test
    void unpublishedCourse_isRejected() {
        givenMaterial("PDF", null);
        givenLessonAccess("DRAFT");
        ApiException ex = assertThrows(ApiException.class,
                () -> service.accessMaterial(STUDENT_ID, MATERIAL_ID, false));
        assertEquals("COURSE_NOT_PUBLISHED", ex.getCode());
    }

    @Test
    void threshold_is90Percent() {
        assertTrue((boolean) ReflectionTestUtils.invokeMethod(
                LearningProgressService.class, "reachesThreshold", 540, 600));
        assertFalse((boolean) ReflectionTestUtils.invokeMethod(
                LearningProgressService.class, "reachesThreshold", 539, 600));
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


    private void givenMaterial(String type, Integer length) {
        LearningMaterial material = new LearningMaterial(LESSON_ID, "Material",
                "https://example.com/file", type, length);
        when(materialRepository.findById(MATERIAL_ID)).thenReturn(Optional.of(material));
    }

    private void givenLessonAccess(String state) {
        when(courseAccessGuard.requireUser(STUDENT_ID)).thenReturn(student(STUDENT_ID));
        when(progressRepository.findLessonContext(LESSON_ID)).thenReturn(Optional.of(lesson(state)));
        when(progressRepository.countActiveEnrollment(STUDENT_ID, COURSE_ID)).thenReturn(1L);
    }

    private void givenCounts(long total, long completed) {
        when(progressRepository.countLessonsOfCourse(COURSE_ID)).thenReturn(total);
        when(progressRepository.countCompletedLessons(STUDENT_ID, COURSE_ID)).thenReturn(completed);
    }

    private static LearningProgress progress(boolean completed, int position) {
        LearningProgress p;
        try {
            var ctor = LearningProgress.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            p = ctor.newInstance();
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
        ReflectionTestUtils.setField(p, "completed", completed);
        ReflectionTestUtils.setField(p, "lastPosition", position);
        return p;
    }

    private static LessonContextView lesson(String state) {
        return new LessonContextView() {
            @Override public Long getLessonId() { return LESSON_ID; }
            @Override public String getLessonTitle() { return "Lesson"; }
            @Override public Long getCourseId() { return COURSE_ID; }
            @Override public String getCourseTitle() { return "Spring Boot 101"; }
            @Override public String getPublicationState() { return state; }
        };
    }

    private static LessonProgressView lessonRow(Long lessonId, Long completed, Integer position, LocalDateTime accessedAt) {
        return new LessonProgressView() {
            @Override public Long getLessonId() { return lessonId; }
            @Override public String getLessonTitle() { return "Lesson " + lessonId; }
            @Override public String getContentType() { return "VIDEO"; }
            @Override public Long getChapterId() { return 1L; }
            @Override public String getChapterTitle() { return "Chapter"; }
            @Override public Long getCompleted() { return completed; }
            @Override public Integer getLastPosition() { return position; }
            @Override public LocalDateTime getLastAccessedAt() { return accessedAt; }
        };
    }
}

