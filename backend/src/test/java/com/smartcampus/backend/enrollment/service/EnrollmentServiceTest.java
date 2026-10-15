package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentHistoryRepository;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import com.smartcampus.backend.enrollment.repository.projection.MyEnrollmentView;
import com.smartcampus.backend.enrollment.repository.projection.UserAccountInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    private static final Long STUDENT_ID = 1L;
    private static final Long COURSE_ID = 10L;
    private static final Long NEW_ENROLLMENT_ID = 100L;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private EnrollmentHistoryRepository enrollmentHistoryRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    // enroll

    @Test
    void enroll_success_createsActiveEnrollmentAndFirstHistoryRow() {
        givenUser("STUDENT", "ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        when(enrollmentRepository.existsByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(false);
        when(enrollmentRepository.saveAndFlush(any(Enrollment.class))).thenAnswer(invocation -> {
            Enrollment saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", NEW_ENROLLMENT_ID); // what the DB would do
            return saved;
        });

        EnrollmentResponse response = enrollmentService.enroll(STUDENT_ID, COURSE_ID);

        assertEquals(NEW_ENROLLMENT_ID, response.enrollmentId());
        assertEquals(STUDENT_ID, response.studentId());
        assertEquals(COURSE_ID, response.courseId());
        assertEquals("Spring Boot 101", response.courseTitle());
        assertEquals(EnrollmentStatus.ACTIVE, response.status());

        ArgumentCaptor<EnrollmentHistory> history = ArgumentCaptor.forClass(EnrollmentHistory.class);
        verify(enrollmentHistoryRepository).save(history.capture());
        assertEquals(NEW_ENROLLMENT_ID, history.getValue().getEnrollmentId());
        assertNull(history.getValue().getPreviousStatus());
        assertEquals(EnrollmentStatus.ACTIVE, history.getValue().getNewStatus());
        assertEquals(STUDENT_ID, history.getValue().getChangedBy());
    }

    @Test
    void enroll_duplicate_isRejectedWith409() {
        givenUser("STUDENT", "ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        when(enrollmentRepository.existsByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(true);

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("ALREADY_ENROLLED", ex.getCode());
        verify(enrollmentRepository, never()).saveAndFlush(any());
        verify(enrollmentHistoryRepository, never()).save(any());
    }

    @Test
    void enroll_concurrentDuplicate_uniqueKeyViolation_isRejectedWith409() {
        givenUser("STUDENT", "ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        when(enrollmentRepository.existsByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(false);
        when(enrollmentRepository.saveAndFlush(any(Enrollment.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry for key uk_enrollments_student_course"));

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("ALREADY_ENROLLED", ex.getCode());
        verify(enrollmentHistoryRepository, never()).save(any());
    }

    @Test
    void enroll_courseNotFound_isRejectedWith404() {
        givenUser("STUDENT", "ACTIVE");
        when(enrollmentRepository.findCourseEnrollmentInfo(COURSE_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("COURSE_NOT_FOUND", ex.getCode());
        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_draftCourse_isRejectedWith400() {
        givenUser("STUDENT", "ACTIVE");
        givenCourse("DRAFT", "OPEN");

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("COURSE_NOT_PUBLISHED", ex.getCode());
        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_archivedCourse_isRejectedWith400() {
        givenUser("STUDENT", "ACTIVE");
        givenCourse("ARCHIVED", "OPEN");

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals("COURSE_NOT_PUBLISHED", ex.getCode());
    }

    @Test
    void enroll_enrollmentWindowClosed_isRejectedWith400() {
        givenUser("STUDENT", "ACTIVE");
        givenCourse("PUBLISHED", "CLOSED");

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("ENROLLMENT_CLOSED", ex.getCode());
        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_byLecturer_isRejectedWith403() {
        givenUser("LECTURER", "ACTIVE");

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("NOT_A_STUDENT", ex.getCode());
        verify(enrollmentRepository, never()).findCourseEnrollmentInfo(any());
    }

    @Test
    void enroll_inactiveStudent_isRejectedWith403() {
        givenUser("STUDENT", "INACTIVE");

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("ACCOUNT_INACTIVE", ex.getCode());
    }

    @Test
    void enroll_unknownUser_isRejectedWith401() {
        when(enrollmentRepository.findUserAccountInfo(STUDENT_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    // my enrollments

    @Test
    void getMyEnrollments_mapsRowsToResponse() {
        LocalDateTime enrolledAt = LocalDateTime.of(2026, 10, 10, 9, 30);
        when(enrollmentRepository.findActiveEnrollmentsOfStudent(STUDENT_ID))
                .thenReturn(List.of(myEnrollmentRow(enrolledAt)));

        List<MyEnrollmentResponse> result = enrollmentService.getMyEnrollments(STUDENT_ID);

        assertEquals(1, result.size());
        MyEnrollmentResponse item = result.get(0);
        assertEquals(NEW_ENROLLMENT_ID, item.enrollmentId());
        assertEquals(COURSE_ID, item.courseId());
        assertEquals("Spring Boot 101", item.courseTitle());
        assertEquals(EnrollmentStatus.ACTIVE, item.status());
        assertEquals(enrolledAt, item.enrolledAt());
    }

    @Test
    void getMyEnrollments_noEnrollment_returnsEmptyList() {
        when(enrollmentRepository.findActiveEnrollmentsOfStudent(STUDENT_ID)).thenReturn(List.of());

        assertTrue(enrollmentService.getMyEnrollments(STUDENT_ID).isEmpty());
    }

    // helpers

    private void givenUser(String role, String status) {
        UserAccountInfo user = new UserAccountInfo() {
            @Override public Long getId() { return STUDENT_ID; }
            @Override public String getRole() { return role; }
            @Override public String getStatus() { return status; }
        };
        when(enrollmentRepository.findUserAccountInfo(STUDENT_ID)).thenReturn(Optional.of(user));
    }

    private void givenCourse(String publicationState, String enrollmentWindow) {
        CourseEnrollmentInfo course = new CourseEnrollmentInfo() {
            @Override public Long getId() { return COURSE_ID; }
            @Override public String getTitle() { return "Spring Boot 101"; }
            @Override public String getPublicationState() { return publicationState; }
            @Override public String getEnrollmentWindow() { return enrollmentWindow; }
        };
        when(enrollmentRepository.findCourseEnrollmentInfo(COURSE_ID)).thenReturn(Optional.of(course));
    }

    private static MyEnrollmentView myEnrollmentRow(LocalDateTime enrolledAt) {
        return new MyEnrollmentView() {
            @Override public Long getEnrollmentId() { return NEW_ENROLLMENT_ID; }
            @Override public String getStatus() { return "ACTIVE"; }
            @Override public LocalDateTime getEnrolledAt() { return enrolledAt; }
            @Override public Long getCourseId() { return COURSE_ID; }
            @Override public String getCourseTitle() { return "Spring Boot 101"; }
            @Override public String getCourseDescription() { return "Intro course"; }
            @Override public String getPublicationState() { return "PUBLISHED"; }
        };
    }
}
