package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentHistoryRepository;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import com.smartcampus.backend.enrollment.repository.projection.UserAccountInfo;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    static final String ROLE_STUDENT = "STUDENT";
    static final String ACCOUNT_ACTIVE = "ACTIVE";
    static final String COURSE_PUBLISHED = "PUBLISHED";
    static final String ENROLLMENT_WINDOW_OPEN = "OPEN";
    static final String SELF_ENROLL_REASON = "Student self-enrollment";

    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentHistoryRepository enrollmentHistoryRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             EnrollmentHistoryRepository enrollmentHistoryRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentHistoryRepository = enrollmentHistoryRepository;
    }

    /**
     * UC-ENROLL-001: the current Student enrolls in a course.
     *
     * Rules:
     *  - the caller is an ACTIVE user with role STUDENT
     *  - the course exists
     *  - the course is PUBLISHED and its enrollment window is open
     *  - at most one enrollment per (student, course); the DB unique key
     *    uk_enrollments_student_course is the final guard for concurrent requests
     */
    @Transactional
    public EnrollmentResponse enroll(Long studentId, Long courseId) {
        requireActiveStudent(studentId);

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

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw alreadyEnrolled(courseId);
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
    }

    /**
     * UC-ENROLL-004: courses the Student currently participates in (ACTIVE only).
     */
    @Transactional(readOnly = true)
    public List<MyEnrollmentResponse> getMyEnrollments(Long studentId) {
        return enrollmentRepository.findActiveEnrollmentsOfStudent(studentId)
                .stream()
                .map(MyEnrollmentResponse::of)
                .toList();
    }

    private void requireActiveStudent(Long userId) {
        UserAccountInfo user = enrollmentRepository.findUserAccountInfo(userId)
                .orElseThrow(() -> EnrollmentException.unauthorized("User " + userId + " does not exist"));

        if (!ROLE_STUDENT.equals(user.getRole())) {
            throw EnrollmentException.forbidden("NOT_A_STUDENT", "Only students can enroll in courses");
        }
        if (!ACCOUNT_ACTIVE.equals(user.getStatus())) {
            throw EnrollmentException.forbidden("ACCOUNT_INACTIVE", "Your account is inactive");
        }
    }

    private static EnrollmentException alreadyEnrolled(Long courseId) {
        return EnrollmentException.conflict(
                "ALREADY_ENROLLED", "You are already enrolled in course " + courseId);
    }
}
