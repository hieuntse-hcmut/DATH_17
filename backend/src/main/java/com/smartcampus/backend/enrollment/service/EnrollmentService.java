package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.common.security.UserAccount;
import com.smartcampus.backend.enrollment.dto.EnrollmentHistoryResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentHistoryRepository;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import com.smartcampus.backend.enrollment.repository.projection.UserAccountInfo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Student self-service: withdraw, my courses, history.
 *
 * Students do NOT enroll themselves: only the course's lecturer or an administrator adds
 * (or reinstates) a student, see EnrollmentManagementService.enrollStudent (UC-ENROLL-002).
 */
@Service
public class EnrollmentService {

    static final String ROLE_STUDENT = "STUDENT";
    static final String ENROLLMENT_WINDOW_OPEN = "OPEN";
    static final String WITHDRAW_REASON = "Student withdrawal";

    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentHistoryRepository enrollmentHistoryRepository;
    private final CourseAccessGuard courseAccessGuard;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             EnrollmentHistoryRepository enrollmentHistoryRepository,
                             CourseAccessGuard courseAccessGuard) {
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentHistoryRepository = enrollmentHistoryRepository;
        this.courseAccessGuard = courseAccessGuard;
    }

    /**
     * UC-ENROLL-005: the Student ends his own ACTIVE enrollment (ACTIVE -> WITHDRAWN).
     * Only the lecturer or an administrator can add him back.
     */
    @Transactional
    public EnrollmentStatusResponse withdraw(Long studentId, Long courseId, String reason) {
        requireStudentRole(studentId);
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> notEnrolled(courseId));
        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE
                || enrollmentRepository.transitionStatus(enrollment.getId(),
                EnrollmentStatus.ACTIVE, EnrollmentStatus.WITHDRAWN) == 0) {
            throw EnrollmentException.conflict("ENROLLMENT_NOT_ACTIVE",
                    "You have no ACTIVE enrollment in course " + courseId);
        }
        enrollmentHistoryRepository.save(new EnrollmentHistory(enrollment.getId(), EnrollmentStatus.ACTIVE,
                EnrollmentStatus.WITHDRAWN, studentId, reasonOr(reason, WITHDRAW_REASON)));
        return EnrollmentStatusResponse.of(reload(enrollment.getId()));
    }

    /** UC-ENROLL-004: courses the Student currently participates in (ACTIVE only). */
    @Transactional(readOnly = true)
    public List<MyEnrollmentResponse> getMyEnrollments(Long studentId) {
        return enrollmentRepository.findActiveEnrollmentsOfStudent(studentId)
                .stream()
                .map(MyEnrollmentResponse::of)
                .toList();
    }

    /** FR-ENROLL-007: status history, visible to the student himself and to the course staff. */
    @Transactional(readOnly = true)
    public List<EnrollmentHistoryResponse> getHistory(Long userId, Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> EnrollmentException.notFound("ENROLLMENT_NOT_FOUND",
                        "Enrollment " + enrollmentId + " does not exist"));
        if (!enrollment.getStudentId().equals(userId)) {
            UserAccount user = courseAccessGuard.requireUser(userId);
            if (!courseAccessGuard.canManageCourse(user, enrollment.getCourseId())) {
                throw EnrollmentException.forbidden("NOT_ALLOWED",
                        "You cannot view the history of this enrollment");
            }
        }
        return enrollmentHistoryRepository.findByEnrollmentIdOrderByCreatedAtAscIdAsc(enrollmentId)
                .stream()
                .map(EnrollmentHistoryResponse::of)
                .toList();
    }

    // ------------------------------------------------------------------ helpers

    private UserAccountInfo requireStudentRole(Long userId) {
        UserAccountInfo user = enrollmentRepository.findUserAccountInfo(userId)
                .orElseThrow(() -> EnrollmentException.unauthorized("User " + userId + " does not exist"));
        if (!ROLE_STUDENT.equals(user.getRole())) {
            throw EnrollmentException.forbidden("NOT_A_STUDENT", "Only students can do this");
        }
        return user;
    }

    private Enrollment reload(Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId).orElseThrow();
    }

    static String reasonOr(String reason, String fallback) {
        return reason == null || reason.isBlank() ? fallback : reason.trim();
    }

    private static EnrollmentException notEnrolled(Long courseId) {
        return EnrollmentException.notFound("NOT_ENROLLED", "You are not enrolled in course " + courseId);
    }
}
