package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.common.security.UserAccount;
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
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import com.smartcampus.backend.enrollment.repository.projection.UserAccountInfo;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Student self-service: enroll / re-enroll, withdraw, my courses, history.
 * Staff actions (roster, enroll a student, remove) are in EnrollmentManagementService.
 */
@Service
public class EnrollmentService {

    static final String ROLE_STUDENT = "STUDENT";
    static final String ACCOUNT_ACTIVE = "ACTIVE";
    static final String COURSE_PUBLISHED = "PUBLISHED";
    static final String ENROLLMENT_WINDOW_OPEN = "OPEN";
    static final String SELF_ENROLL_REASON = "Student self-enrollment";
    static final String RE_ENROLL_REASON = "Student re-enrollment";
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
     * UC-ENROLL-001: the current Student enrolls in a course.
     *
     *  - the caller is an ACTIVE user with role STUDENT
     *  - the course exists, is PUBLISHED and its enrollment window is open
     *  - no enrollment yet          -> create ACTIVE (unique key guards concurrent requests)
     *  - WITHDRAWN enrollment       -> reactivate the same record (A1, BR-ENROLL-006)
     *  - ACTIVE enrollment          -> 409 ALREADY_ENROLLED (E2)
     *  - REMOVED enrollment         -> 403 ENROLLMENT_REMOVED, only staff can reinstate (E4)
     */
    @Transactional
    public EnrollmentResponse enroll(Long studentId, Long courseId) {
        // Chặn hoàn toàn tính năng tự đăng ký từ phía sinh viên
        throw EnrollmentException.forbidden(
                "SELF_ENROLL_DISABLED",
                "Students are not allowed to self-enroll in courses. Please contact your instructor or system administrator."
        );

    /* Có thể xóa hoặc comment lại toàn bộ logic cũ ở dưới:
    requireActiveStudent(studentId);
    CourseEnrollmentInfo course = requireEnrollableCourse(courseId);

    Optional<Enrollment> existing = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
    if (existing.isPresent()) {
        return reactivateWithdrawn(existing.get(), studentId, course);
    }

    Enrollment enrollment;
    try {
        enrollment = enrollmentRepository.saveAndFlush(new Enrollment(studentId, courseId));
    } catch (DataIntegrityViolationException ex) {
        throw alreadyEnrolled(courseId);
    }
    enrollmentHistoryRepository.save(
            EnrollmentHistory.initial(enrollment.getId(), studentId, SELF_ENROLL_REASON));
    return EnrollmentResponse.of(enrollment, course);
    */
    }

    /** UC-ENROLL-005: the Student ends his own ACTIVE enrollment (ACTIVE -> WITHDRAWN). */
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

    private EnrollmentResponse reactivateWithdrawn(Enrollment existing, Long studentId, CourseEnrollmentInfo course) {
        Long courseId = course.getId();
        switch (existing.getStatus()) {
            case ACTIVE -> throw alreadyEnrolled(courseId);
            case REMOVED -> throw EnrollmentException.forbidden("ENROLLMENT_REMOVED",
                    "You were removed from course " + courseId + "; ask the lecturer to reinstate you");
            case WITHDRAWN -> {
                // conditional update: a concurrent request that won first makes this return 0
                int updated = enrollmentRepository.transitionStatus(existing.getId(),
                        EnrollmentStatus.WITHDRAWN, EnrollmentStatus.ACTIVE);
                if (updated == 0) {
                    throw alreadyEnrolled(courseId);
                }
                enrollmentHistoryRepository.save(new EnrollmentHistory(existing.getId(),
                        EnrollmentStatus.WITHDRAWN, EnrollmentStatus.ACTIVE, studentId, RE_ENROLL_REASON));
                return EnrollmentResponse.of(reload(existing.getId()), course);
            }
            default -> throw new IllegalStateException("Unknown status " + existing.getStatus());
        }
    }

    private CourseEnrollmentInfo requireEnrollableCourse(Long courseId) {
        CourseEnrollmentInfo course = enrollmentRepository.findCourseEnrollmentInfo(courseId)
                .orElseThrow(() -> EnrollmentException.notFound(
                        "COURSE_NOT_FOUND", "Course " + courseId + " does not exist"));
        if (!COURSE_PUBLISHED.equals(course.getPublicationState())) {
            throw EnrollmentException.badRequest(
                    "COURSE_NOT_PUBLISHED", "Course " + courseId + " is not published");
        }
        if (!ENROLLMENT_WINDOW_OPEN.equals(course.getEnrollmentWindow())) {
            throw EnrollmentException.badRequest(
                    "ENROLLMENT_CLOSED", "Course " + courseId + " is not accepting new enrollments");
        }
        return course;
    }

    private void requireActiveStudent(Long userId) {
        UserAccountInfo user = requireStudentRole(userId);
        if (!ACCOUNT_ACTIVE.equals(user.getStatus())) {
            throw EnrollmentException.forbidden("ACCOUNT_INACTIVE", "Your account is inactive");
        }
    }

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

    private static EnrollmentException alreadyEnrolled(Long courseId) {
        return EnrollmentException.conflict(
                "ALREADY_ENROLLED", "You are already enrolled in course " + courseId);
    }

    private static EnrollmentException notEnrolled(Long courseId) {
        return EnrollmentException.notFound("NOT_ENROLLED", "You are not enrolled in course " + courseId);
    }
}
