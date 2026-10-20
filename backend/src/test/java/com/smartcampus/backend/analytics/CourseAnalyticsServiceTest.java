package com.smartcampus.backend.analytics;

import com.smartcampus.backend.analytics.dto.CourseAnalyticsResponse;
import com.smartcampus.backend.analytics.repository.CourseAnalyticsRepository;
import com.smartcampus.backend.analytics.repository.CourseEnrollmentStats;
import com.smartcampus.backend.analytics.service.CourseAnalyticsService;
import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.progress.repository.LearningProgressRepository;
import com.smartcampus.backend.progress.repository.projection.StudentProgressView;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.smartcampus.backend.support.TestData.admin;
import static com.smartcampus.backend.support.TestData.lecturer;
import static com.smartcampus.backend.support.TestData.student;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseAnalyticsServiceTest {

    private static final Long COURSE_ID = 10L;

    @Mock private CourseAnalyticsRepository analyticsRepository;
    @Mock private LearningProgressRepository progressRepository;
    @Mock private CourseAccessGuard courseAccessGuard;
    @InjectMocks private CourseAnalyticsService service;

    @Test
    void summary_computesCompletionRateAndAverageProgress() {
        when(courseAccessGuard.requireUser(3L)).thenReturn(lecturer(3L));
        givenStats(COURSE_ID, 4);
        when(progressRepository.countLessonsOfCourse(COURSE_ID)).thenReturn(4L);
        LocalDateTime t = LocalDateTime.of(2026, 10, 18, 8, 0);
        when(progressRepository.findClassProgress(COURSE_ID)).thenReturn(List.of(
                row(4L, t),      // completed (100%)
                row(2L, t),      // in progress (50%)
                row(0L, t),      // opened but nothing completed: in progress (0%)
                row(0L, null))); // not started

        CourseAnalyticsResponse r = service.getCourseSummary(3L, COURSE_ID);

        assertEquals(4, r.activeEnrollments());
        assertEquals(1, r.withdrawnEnrollments());
        assertEquals(4, r.totalLessons());
        assertEquals(1, r.studentsCompleted());
        assertEquals(2, r.studentsInProgress());
        assertEquals(1, r.studentsNotStarted());
        assertEquals(25.0, r.completionRate());
        assertEquals(37.5, r.averageProgressPercent());
    }

    @Test
    void summary_courseWithoutStudents_hasZeroRates() {
        when(courseAccessGuard.requireUser(5L)).thenReturn(admin(5L));
        givenStats(COURSE_ID, 0);
        when(progressRepository.countLessonsOfCourse(COURSE_ID)).thenReturn(0L);
        when(progressRepository.findClassProgress(COURSE_ID)).thenReturn(List.of());

        CourseAnalyticsResponse r = service.getCourseSummary(5L, COURSE_ID);

        assertEquals(0.0, r.completionRate());
        assertEquals(0.0, r.averageProgressPercent());
    }

    @Test
    void myCoursesSummary_student_isRejectedWith403() {
        when(courseAccessGuard.requireUser(1L)).thenReturn(student(1L));

        ApiException ex = assertThrows(ApiException.class, () -> service.getMyCoursesSummary(1L));

        assertEquals("NOT_COURSE_STAFF", ex.getCode());
    }

    @Test
    void myCoursesSummary_lecturer_returnsOneRowPerManagedCourse() {
        when(courseAccessGuard.requireUser(3L)).thenReturn(lecturer(3L));
        when(courseAccessGuard.managedCourseIds(lecturer(3L))).thenReturn(List.of(10L, 11L));
        givenStats(10L, 0);
        givenStats(11L, 0);
        when(progressRepository.countLessonsOfCourse(org.mockito.ArgumentMatchers.anyLong())).thenReturn(0L);
        when(progressRepository.findClassProgress(org.mockito.ArgumentMatchers.anyLong())).thenReturn(List.of());

        assertEquals(List.of(10L, 11L), service.getMyCoursesSummary(3L).stream().map(CourseAnalyticsResponse::courseId).toList());
    }

    private void givenStats(Long courseId, long active) {
        when(analyticsRepository.findEnrollmentStats(courseId)).thenReturn(Optional.of(
                new CourseEnrollmentStats(courseId, "Course " + courseId, "PUBLISHED", true, active, 1, 0, active + 1, active)));
    }

    private static StudentProgressView row(Long completed, LocalDateTime lastAccessedAt) {
        return new StudentProgressView() {
            @Override public Long getStudentId() { return 1L; }
            @Override public String getUsername() { return "s"; }
            @Override public String getFullName() { return "S"; }
            @Override public Long getCompletedLessons() { return completed; }
            @Override public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
        };
    }
}
