package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.common.security.UserAccount;
import com.smartcampus.backend.enrollment.dto.EnrollStudentRequest;
import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentHistoryRepository;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static com.smartcampus.backend.support.TestData.admin;
import static com.smartcampus.backend.support.TestData.course;
import static com.smartcampus.backend.support.TestData.enrollment;
import static com.smartcampus.backend.support.TestData.lecturer;
import static com.smartcampus.backend.support.TestData.student;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentManagementServiceTest {

    private static final Long LECTURER_ID = 3L;
    private static final Long ADMIN_ID = 5L;
    private static final Long STUDENT_ID = 1L;
    private static final Long COURSE_ID = 10L;
    private static final Long ENROLLMENT_ID = 100L;

    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private EnrollmentHistoryRepository enrollmentHistoryRepository;
    @Mock private CourseAccessGuard courseAccessGuard;
    @Mock private NotificationService notificationService;
    @InjectMocks private EnrollmentManagementService service;

    // ================================================================ roster

    @Test
    void getRoster_notCourseStaff_isRejected() {
        UserAccount stranger = lecturer(99L);
        when(courseAccessGuard.requireUser(99L)).thenReturn(stranger);
        doThrow(ApiException.forbidden("NOT_COURSE_STAFF", "no"))
                .when(courseAccessGuard).requireCourseManager(stranger, COURSE_ID);

        ApiException ex = assertThrows(ApiException.class, () -> service.getRoster(99L, COURSE_ID, false));

        assertEquals("NOT_COURSE_STAFF", ex.getCode());
        verify(enrollmentRepository, never()).findRoster(any(), eq(false));
    }

    // ======================================================== enroll student

    @Test
    void enrollStudent_newStudent_createsEnrollmentHistoryAndNotification() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("OPEN");
        givenStudentAccount(student(STUDENT_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(Optional.empty());
        when(enrollmentRepository.saveAndFlush(any(Enrollment.class))).thenAnswer(inv -> {
            Enrollment e = inv.getArgument(0);
            ReflectionTestUtils.setField(e, "id", ENROLLMENT_ID);
            return e;
        });

        EnrollmentResponse response = service.enrollStudent(LECTURER_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, false, null));

        assertEquals(STUDENT_ID, response.studentId());
        EnrollmentHistory history = capturedHistory();
        assertEquals(LECTURER_ID, history.getChangedBy());
        assertEquals(EnrollmentManagementService.STAFF_ENROLL_REASON, history.getReason());
        verify(notificationService).notify(eq(STUDENT_ID), eq(NotificationType.ENROLLED_BY_STAFF), anyString(), anyString(), eq("/courses/10"));
        verify(enrollmentRepository, never()).insertAuditLog(any(), any(), any(), any());
    }

    @Test
    void enrollStudent_removedStudent_isReinstated() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("OPEN");
        givenStudentAccount(student(STUDENT_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.REMOVED)));
        when(enrollmentRepository.transitionStatus(ENROLLMENT_ID, EnrollmentStatus.REMOVED, EnrollmentStatus.ACTIVE))
                .thenReturn(1);
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE)));

        EnrollmentResponse response = service.enrollStudent(LECTURER_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, false, "Appeal accepted"));

        assertEquals(EnrollmentStatus.ACTIVE, response.status());
        EnrollmentHistory history = capturedHistory();
        assertEquals(EnrollmentStatus.REMOVED, history.getPreviousStatus());
        assertEquals("Appeal accepted", history.getReason());
    }

    @Test
    void enrollStudent_alreadyActive_isRejectedWith409() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("OPEN");
        givenStudentAccount(student(STUDENT_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE)));

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> service.enrollStudent(LECTURER_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, false, null)));

        assertEquals("ALREADY_ENROLLED", ex.getCode());
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    @Test
    void enrollStudent_windowClosedWithoutOverride_isRejectedWith400() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("CLOSED");
        givenStudentAccount(student(STUDENT_ID));

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> service.enrollStudent(LECTURER_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, false, null)));

        assertEquals("ENROLLMENT_CLOSED", ex.getCode());
    }

    @Test
    void enrollStudent_lecturerCannotOverrideClosedWindow() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("CLOSED");
        givenStudentAccount(student(STUDENT_ID));

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> service.enrollStudent(LECTURER_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, true, "please")));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("OVERRIDE_NOT_ALLOWED", ex.getCode());
    }

    @Test
    void enrollStudent_adminOverrideWithoutReason_isRejectedWith400() {
        givenActor(admin(ADMIN_ID));
        givenCourse("CLOSED");
        givenStudentAccount(student(STUDENT_ID));

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> service.enrollStudent(ADMIN_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, true, "   ")));

        assertEquals("OVERRIDE_REASON_REQUIRED", ex.getCode());
    }

    @Test
    void enrollStudent_adminOverrideWithReason_enrollsAndWritesAuditLog() {
        givenActor(admin(ADMIN_ID));
        givenCourse("CLOSED");
        givenStudentAccount(student(STUDENT_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(Optional.empty());
        when(enrollmentRepository.saveAndFlush(any(Enrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        service.enrollStudent(ADMIN_ID, COURSE_ID, new EnrollStudentRequest(STUDENT_ID, true, "Late registration"));

        verify(enrollmentRepository).insertAuditLog(ADMIN_ID, STUDENT_ID,
                EnrollmentManagementService.AUDIT_OVERRIDE, "Course 10: Late registration");
        assertEquals("Late registration", capturedHistory().getReason());
    }

    @Test
    void enrollStudent_unknownStudent_isRejectedWith404() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("OPEN");
        when(courseAccessGuard.findUser(STUDENT_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class, () -> service.enrollStudent(LECTURER_ID, COURSE_ID,
                new EnrollStudentRequest(STUDENT_ID, false, null)));

        assertEquals("STUDENT_NOT_FOUND", ex.getCode());
    }

    @Test
    void enrollStudent_targetIsNotAStudent_orIsInactive_isRejectedWith400() {
        givenActor(lecturer(LECTURER_ID));
        givenCourse("OPEN");

        givenStudentAccount(lecturer(STUDENT_ID));
        assertEquals("NOT_A_STUDENT", assertThrows(EnrollmentException.class, () -> service.enrollStudent(LECTURER_ID,
                COURSE_ID, new EnrollStudentRequest(STUDENT_ID, false, null))).getCode());

        givenStudentAccount(new UserAccount(STUDENT_ID, UserAccount.STUDENT, "INACTIVE", "x"));
        assertEquals("STUDENT_INACTIVE", assertThrows(EnrollmentException.class, () -> service.enrollStudent(LECTURER_ID,
                COURSE_ID, new EnrollStudentRequest(STUDENT_ID, false, null))).getCode());
    }

    // ================================================================ remove

    @Test
    void removeStudent_active_becomesRemovedWithHistoryAuditAndNotification() {
        givenActor(lecturer(LECTURER_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE)));
        when(enrollmentRepository.transitionStatus(ENROLLMENT_ID, EnrollmentStatus.ACTIVE, EnrollmentStatus.REMOVED))
                .thenReturn(1);
        when(enrollmentRepository.findCourseEnrollmentInfo(COURSE_ID))
                .thenReturn(Optional.of(course(COURSE_ID, "Spring Boot 101", "PUBLISHED", "OPEN")));
        when(enrollmentRepository.findById(ENROLLMENT_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.REMOVED)));

        EnrollmentStatusResponse response = service.removeStudent(LECTURER_ID, COURSE_ID, STUDENT_ID, "Cheating");

        assertEquals(EnrollmentStatus.REMOVED, response.status());
        EnrollmentHistory history = capturedHistory();
        assertEquals(EnrollmentStatus.ACTIVE, history.getPreviousStatus());
        assertEquals(EnrollmentStatus.REMOVED, history.getNewStatus());
        verify(enrollmentRepository).insertAuditLog(LECTURER_ID, STUDENT_ID,
                EnrollmentManagementService.AUDIT_REMOVE, "Course 10: Cheating");
        verify(notificationService).notify(eq(STUDENT_ID), eq(NotificationType.REMOVED_FROM_COURSE), anyString(), anyString(), anyString());
    }

    @Test
    void removeStudent_notActive_isRejectedWith409() {
        givenActor(lecturer(LECTURER_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(enrollment(ENROLLMENT_ID, STUDENT_ID, COURSE_ID, EnrollmentStatus.WITHDRAWN)));

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> service.removeStudent(LECTURER_ID, COURSE_ID, STUDENT_ID, null));

        assertEquals("ENROLLMENT_NOT_ACTIVE", ex.getCode());
        verify(enrollmentRepository, never()).insertAuditLog(any(), any(), any(), any());
    }

    @Test
    void removeStudent_notEnrolled_isRejectedWith404() {
        givenActor(lecturer(LECTURER_ID));
        when(enrollmentRepository.findByStudentIdAndCourseId(STUDENT_ID, COURSE_ID)).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> service.removeStudent(LECTURER_ID, COURSE_ID, STUDENT_ID, null));

        assertEquals("NOT_ENROLLED", ex.getCode());
    }

    // =============================================================== helpers

    private void givenActor(UserAccount actor) {
        when(courseAccessGuard.requireUser(actor.id())).thenReturn(actor);
    }

    private void givenCourse(String window) {
        when(enrollmentRepository.findCourseEnrollmentInfo(COURSE_ID))
                .thenReturn(Optional.of(course(COURSE_ID, "Spring Boot 101", "PUBLISHED", window)));
    }

    private void givenStudentAccount(UserAccount account) {
        when(courseAccessGuard.findUser(STUDENT_ID)).thenReturn(Optional.of(account));
    }

    private EnrollmentHistory capturedHistory() {
        ArgumentCaptor<EnrollmentHistory> captor = ArgumentCaptor.forClass(EnrollmentHistory.class);
        verify(enrollmentHistoryRepository).save(captor.capture());
        return captor.getValue();
    }
}
