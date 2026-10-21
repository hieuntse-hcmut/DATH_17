package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.enrollment.dto.EnrollmentHistoryResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentHistoryRepository;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import com.smartcampus.backend.enrollment.repository.projection.MyEnrollmentView;
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

import static com.smartcampus.backend.support.TestData.course;
import static com.smartcampus.backend.support.TestData.enrollment;
import static com.smartcampus.backend.support.TestData.lecturer;
import static com.smartcampus.backend.support.TestData.userInfo;
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
    private static final Long ENROLLMENT_ID = 100L;

    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private EnrollmentHistoryRepository enrollmentHistoryRepository;
    @Mock private CourseAccessGuard courseAccessGuard;
    @InjectMocks private EnrollmentService enrollmentService;

    // ================================================================ enroll

    @Test
    void enroll_newStudent_createsActiveEnrollmentAndFirstHistoryRow() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(Optional.empty());
        when(enrollmentRepository.saveAndFlush(any(Enrollment.class))).thenAnswer(invocation -> {
            Enrollment saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", ENROLLMENT_ID);
            return saved;
        });

        EnrollmentResponse response = enrollmentService.enroll(STUDENT_ID, COURSE_ID);

        assertEquals(ENROLLMENT_ID, response.enrollmentId());
        assertEquals(EnrollmentStatus.ACTIVE, response.status());
        assertEquals("Spring Boot 101", response.courseTitle());
        EnrollmentHistory history = capturedHistory();
        assertNull(history.getPreviousStatus());
        assertEquals(EnrollmentStatus.ACTIVE, history.getNewStatus());
        assertEquals(STUDENT_ID, history.getChangedBy());
    }

    @Test
    void enroll_alreadyActive_isRejectedWith409() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        givenExisting(EnrollmentStatus.ACTIVE);

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("ALREADY_ENROLLED", ex.getCode());
        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_afterWithdrawal_reactivatesTheSameRecord() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        givenExisting(EnrollmentStatus.WITHDRAWN);
        when(enrollmentRepository.transitionStatus(ENROLLMENT_ID, EnrollmentStatus.WITHDRAWN, EnrollmentStatus.ACTIVE))
                .thenReturn(1);
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE)));

        EnrollmentResponse response = enrollmentService.enroll(STUDENT_ID, COURSE_ID);

        assertEquals(ENROLLMENT_ID, response.enrollmentId());
        assertEquals(EnrollmentStatus.ACTIVE, response.status());
        EnrollmentHistory history = capturedHistory();
        assertEquals(EnrollmentStatus.WITHDRAWN, history.getPreviousStatus());
        assertEquals(EnrollmentStatus.ACTIVE, history.getNewStatus());
        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_afterWithdrawal_concurrentRequestWonFirst_isRejectedWith409() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        givenExisting(EnrollmentStatus.WITHDRAWN);
        when(enrollmentRepository.transitionStatus(ENROLLMENT_ID, EnrollmentStatus.WITHDRAWN, EnrollmentStatus.ACTIVE))
                .thenReturn(0);

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals("ALREADY_ENROLLED", ex.getCode());
        verify(enrollmentHistoryRepository, never()).save(any());
    }

    @Test
    void enroll_removedStudent_cannotReEnrollHimself() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        givenExisting(EnrollmentStatus.REMOVED);

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("ENROLLMENT_REMOVED", ex.getCode());
        verify(enrollmentRepository, never()).transitionStatus(any(), any(), any());
    }

    @Test
    void enroll_concurrentInsert_uniqueKeyViolation_isRejectedWith409() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "OPEN");
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(Optional.empty());
        when(enrollmentRepository.saveAndFlush(any(Enrollment.class)))
                .thenThrow(new DataIntegrityViolationException("uk_enrollments_student_course"));

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals("ALREADY_ENROLLED", ex.getCode());
        verify(enrollmentHistoryRepository, never()).save(any());
    }

    @Test
    void enroll_courseNotFound_isRejectedWith404() {
        givenStudent("ACTIVE");
        when(enrollmentRepository.findCourseEnrollmentInfo(COURSE_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("COURSE_NOT_FOUND", ex.getCode());
    }

    @Test
    void enroll_draftOrArchivedCourse_isRejectedWith400() {
        givenStudent("ACTIVE");
        givenCourse("DRAFT", "OPEN");
        assertEquals("COURSE_NOT_PUBLISHED",
                assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID)).getCode());

        givenCourse("ARCHIVED", "OPEN");
        assertEquals("COURSE_NOT_PUBLISHED",
                assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID)).getCode());
    }

    @Test
    void enroll_enrollmentWindowClosed_isRejectedWith400() {
        givenStudent("ACTIVE");
        givenCourse("PUBLISHED", "CLOSED");

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("ENROLLMENT_CLOSED", ex.getCode());
    }

    @Test
    void enroll_byLecturer_isRejectedWith403() {
        when(enrollmentRepository.findUserAccountInfo(STUDENT_ID)).thenReturn(Optional.of(userInfo(STUDENT_ID, "LECTURER", "ACTIVE")));

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals("NOT_A_STUDENT", ex.getCode());
        verify(enrollmentRepository, never()).findCourseEnrollmentInfo(any());
    }

    @Test
    void enroll_inactiveStudent_isRejectedWith403() {
        givenStudent("INACTIVE");

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("ACCOUNT_INACTIVE", ex.getCode());
    }

    @Test
    void enroll_unknownUser_isRejectedWith401() {
        when(enrollmentRepository.findUserAccountInfo(STUDENT_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> enrollmentService.enroll(STUDENT_ID, COURSE_ID));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    // ============================================================== withdraw

    @Test
    void withdraw_activeEnrollment_becomesWithdrawnWithHistory() {
        givenStudent("ACTIVE");
        givenExisting(EnrollmentStatus.ACTIVE);
        when(enrollmentRepository.transitionStatus(ENROLLMENT_ID, EnrollmentStatus.ACTIVE, EnrollmentStatus.WITHDRAWN))
                .thenReturn(1);
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.WITHDRAWN)));

        EnrollmentStatusResponse response = enrollmentService.withdraw(STUDENT_ID, COURSE_ID, "  Schedule conflict ");

        assertEquals(EnrollmentStatus.WITHDRAWN, response.status());
        EnrollmentHistory history = capturedHistory();
        assertEquals(EnrollmentStatus.ACTIVE, history.getPreviousStatus());
        assertEquals(EnrollmentStatus.WITHDRAWN, history.getNewStatus());
        assertEquals("Schedule conflict", history.getReason());
    }

    @Test
    void withdraw_withoutReason_usesDefaultReason() {
        givenStudent("ACTIVE");
        givenExisting(EnrollmentStatus.ACTIVE);
        when(enrollmentRepository.transitionStatus(ENROLLMENT_ID, EnrollmentStatus.ACTIVE, EnrollmentStatus.WITHDRAWN))
                .thenReturn(1);
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.WITHDRAWN)));

        enrollmentService.withdraw(STUDENT_ID, COURSE_ID, null);

        assertEquals(EnrollmentService.WITHDRAW_REASON, capturedHistory().getReason());
    }

    @Test
    void withdraw_notEnrolled_isRejectedWith404() {
        givenStudent("ACTIVE");
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.withdraw(STUDENT_ID, COURSE_ID, null));

        assertEquals("NOT_ENROLLED", ex.getCode());
    }

    @Test
    void withdraw_alreadyWithdrawn_isRejectedWith409() {
        givenStudent("ACTIVE");
        givenExisting(EnrollmentStatus.WITHDRAWN);

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.withdraw(STUDENT_ID, COURSE_ID, null));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("ENROLLMENT_NOT_ACTIVE", ex.getCode());
        verify(enrollmentRepository, never()).transitionStatus(any(), any(), any());
    }

    // ======================================================= my enrollments

    @Test
    void getMyEnrollments_mapsRows() {
        LocalDateTime enrolledAt = LocalDateTime.of(2026, 10, 10, 9, 30);
        when(enrollmentRepository.findActiveEnrollmentsOfStudent(STUDENT_ID)).thenReturn(List.of(new MyEnrollmentView() {
            @Override public Long getEnrollmentId() { return ENROLLMENT_ID; }
            @Override public String getStatus() { return "ACTIVE"; }
            @Override public LocalDateTime getEnrolledAt() { return enrolledAt; }
            @Override public Long getCourseId() { return COURSE_ID; }
            @Override public String getCourseTitle() { return "Spring Boot 101"; }
            @Override public String getCourseDescription() { return "Intro"; }
            @Override public String getPublicationState() { return "PUBLISHED"; }
        }));

        List<MyEnrollmentResponse> result = enrollmentService.getMyEnrollments(STUDENT_ID);

        assertEquals(1, result.size());
        assertEquals(COURSE_ID, result.getFirst().courseId());
        assertEquals(EnrollmentStatus.ACTIVE, result.getFirst().status());
    }

    @Test
    void getMyEnrollments_noEnrollment_returnsEmptyList() {
        when(enrollmentRepository.findActiveEnrollmentsOfStudent(STUDENT_ID)).thenReturn(List.of());

        assertTrue(enrollmentService.getMyEnrollments(STUDENT_ID).isEmpty());
    }

    // =============================================================== history

    @Test
    void getHistory_ownerSeesHisHistory() {
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE)));
        when(enrollmentHistoryRepository.findByEnrollmentIdOrderByCreatedAtAscIdAsc(ENROLLMENT_ID))
                .thenReturn(List.of(EnrollmentHistory.initial(ENROLLMENT_ID, STUDENT_ID, "x")));

        List<EnrollmentHistoryResponse> history = enrollmentService.getHistory(STUDENT_ID, ENROLLMENT_ID);

        assertEquals(1, history.size());
        verify(courseAccessGuard, never()).requireUser(any());
    }

    @Test
    void getHistory_lecturerOfAnotherCourse_isRejectedWith403() {
        Long otherLecturer = 50L;
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE)));
        when(courseAccessGuard.requireUser(otherLecturer)).thenReturn(lecturer(otherLecturer));
        when(courseAccessGuard.canManageCourse(lecturer(otherLecturer), COURSE_ID)).thenReturn(false);

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> enrollmentService.getHistory(otherLecturer, ENROLLMENT_ID));

        assertEquals("NOT_ALLOWED", ex.getCode());
    }

    // =============================================================== helpers

    private void givenStudent(String status) {
        when(enrollmentRepository.findUserAccountInfo(STUDENT_ID)).thenReturn(Optional.of(userInfo(STUDENT_ID, "STUDENT", status)));
    }

    private void givenCourse(String publicationState, String window) {
        when(enrollmentRepository.findCourseEnrollmentInfo(COURSE_ID))
                .thenReturn(Optional.of(course(COURSE_ID, "Spring Boot 101", publicationState, window)));
    }

    private void givenExisting(EnrollmentStatus status) {
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, status)));
    }

    private EnrollmentHistory capturedHistory() {
        ArgumentCaptor<EnrollmentHistory> captor = ArgumentCaptor.forClass(EnrollmentHistory.class);
        verify(enrollmentHistoryRepository).save(captor.capture());
        return captor.getValue();
    }
}
