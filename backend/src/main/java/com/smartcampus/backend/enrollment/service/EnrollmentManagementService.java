package com.smartcampus.backend.enrollment.service;

import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.common.security.UserAccount;
import com.smartcampus.backend.enrollment.dto.EnrollStudentRequest;
import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.dto.RosterEntryResponse;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentHistoryRepository;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Staff side of Enrollment (assigned Lecturer or Administrator):
 * UC-ENROLL-002 enroll a student (with Administrator override),
 * UC-ENROLL-003 roster, UC-ENROLL-006 remove a student.
 */
@Service
public class EnrollmentManagementService {

    static final String AUDIT_OVERRIDE = "ENROLLMENT_OVERRIDE";
    static final String AUDIT_REMOVE = "ENROLLMENT_REMOVED";
    static final String STAFF_ENROLL_REASON = "Enrolled by staff";
    static final String STAFF_REMOVE_REASON = "Removed by staff";

    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentHistoryRepository enrollmentHistoryRepository;
    private final CourseAccessGuard courseAccessGuard;
    private final NotificationService notificationService;

    public EnrollmentManagementService(EnrollmentRepository enrollmentRepository,
                                       EnrollmentHistoryRepository enrollmentHistoryRepository,
                                       CourseAccessGuard courseAccessGuard,
                                       NotificationService notificationService) {
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentHistoryRepository = enrollmentHistoryRepository;
        this.courseAccessGuard = courseAccessGuard;
        this.notificationService = notificationService;
    }

    /** UC-ENROLL-003: ACTIVE students by default; includeInactive adds WITHDRAWN and REMOVED. */
    @Transactional(readOnly = true)
    public List<RosterEntryResponse> getRoster(Long actorId, Long courseId, boolean includeInactive) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);
        return enrollmentRepository.findRoster(courseId, includeInactive)
                .stream()
                .map(RosterEntryResponse::of)
                .toList();
    }

    /**
     * UC-ENROLL-002.
     *  - new student                        -> ACTIVE enrollment
     *  - WITHDRAWN or REMOVED               -> reinstated to ACTIVE (same record)
     *  - already ACTIVE                     -> 409 ALREADY_ENROLLED
     *  - window closed                      -> 400 ENROLLMENT_CLOSED, unless an Administrator
     *                                          sets adminOverride with a reason (A3): history + audit log
     */
    @Transactional
    public EnrollmentResponse enrollStudent(Long actorId, Long courseId, EnrollStudentRequest request) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);
        CourseEnrollmentInfo course = enrollmentRepository.findCourseEnrollmentInfo(courseId).orElseThrow();

        Long studentId = request.studentId();
        UserAccount student = courseAccessGuard.findUser(studentId)
                .orElseThrow(() -> EnrollmentException.notFound("STUDENT_NOT_FOUND",
                        "User " + studentId + " does not exist"));
        if (!student.isStudent()) {
            throw EnrollmentException.badRequest("NOT_A_STUDENT", "User " + studentId + " is not a student");
        }
        if (!student.isActive()) {
            throw EnrollmentException.badRequest("STUDENT_INACTIVE", "Student " + studentId + " is inactive");
        }

        boolean override = checkEnrollmentWindow(actor, course, request);
        String reason = EnrollmentService.reasonOr(request.reason(), STAFF_ENROLL_REASON);

        Enrollment enrollment;
        Optional<Enrollment> existing = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (existing.isPresent()) {
            enrollment = reinstate(existing.get(), actorId, reason);
        } else {
            enrollment = create(studentId, courseId, actorId, reason);
        }

        if (override) {
            enrollmentRepository.insertAuditLog(actorId, studentId, AUDIT_OVERRIDE,
                    "Course " + courseId + ": " + request.reason().trim());
        }
        notificationService.notify(studentId, NotificationType.ENROLLED_BY_STAFF,
                "Added to a course",
                "You were enrolled in \"" + course.getTitle() + "\".",
                "/courses/" + courseId);
        return EnrollmentResponse.of(enrollment, course);
    }

    /** UC-ENROLL-006: ACTIVE -> REMOVED, with history, audit log and a notification to the student. */
    @Transactional
    public EnrollmentStatusResponse removeStudent(Long actorId, Long courseId, Long studentId, String reason) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> EnrollmentException.notFound("NOT_ENROLLED",
                        "Student " + studentId + " is not enrolled in course " + courseId));
        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE
                || enrollmentRepository.transitionStatus(enrollment.getId(),
                EnrollmentStatus.ACTIVE, EnrollmentStatus.REMOVED) == 0) {
            throw EnrollmentException.conflict("ENROLLMENT_NOT_ACTIVE",
                    "Student " + studentId + " has no ACTIVE enrollment in course " + courseId);
        }
        String finalReason = EnrollmentService.reasonOr(reason, STAFF_REMOVE_REASON);
        enrollmentHistoryRepository.save(new EnrollmentHistory(enrollment.getId(), EnrollmentStatus.ACTIVE,
                EnrollmentStatus.REMOVED, actorId, finalReason));
        enrollmentRepository.insertAuditLog(actorId, studentId, AUDIT_REMOVE,
                "Course " + courseId + ": " + finalReason);

        String courseTitle = enrollmentRepository.findCourseEnrollmentInfo(courseId)
                .map(CourseEnrollmentInfo::getTitle).orElse("course " + courseId);
        notificationService.notify(studentId, NotificationType.REMOVED_FROM_COURSE,
                "Removed from a course",
                "You were removed from \"" + courseTitle + "\". Reason: " + finalReason,
                "/courses/" + courseId);
        return EnrollmentStatusResponse.of(enrollmentRepository.findById(enrollment.getId()).orElseThrow());
    }

    // ------------------------------------------------------------------ helpers

    /** @return true when an Administrator override is used */
    private boolean checkEnrollmentWindow(UserAccount actor, CourseEnrollmentInfo course, EnrollStudentRequest request) {
        if (EnrollmentService.ENROLLMENT_WINDOW_OPEN.equals(course.getEnrollmentWindow())) {
            return false;
        }
        if (!Boolean.TRUE.equals(request.adminOverride())) {
            throw EnrollmentException.badRequest("ENROLLMENT_CLOSED",
                    "Course " + course.getId() + " is not accepting new enrollments");
        }
        if (!actor.isAdmin()) {
            throw EnrollmentException.forbidden("OVERRIDE_NOT_ALLOWED",
                    "Only an administrator can override a closed enrollment window");
        }
        if (request.reason() == null || request.reason().isBlank()) {
            throw EnrollmentException.badRequest("OVERRIDE_REASON_REQUIRED",
                    "A reason is required to override a closed enrollment window");
        }
        return true;
    }

    private Enrollment reinstate(Enrollment existing, Long actorId, String reason) {
        EnrollmentStatus from = existing.getStatus();
        if (from == EnrollmentStatus.ACTIVE
                || enrollmentRepository.transitionStatus(existing.getId(), from, EnrollmentStatus.ACTIVE) == 0) {
            throw EnrollmentException.conflict("ALREADY_ENROLLED",
                    "Student " + existing.getStudentId() + " is already enrolled in course " + existing.getCourseId());
        }
        enrollmentHistoryRepository.save(new EnrollmentHistory(existing.getId(), from,
                EnrollmentStatus.ACTIVE, actorId, reason));
        return enrollmentRepository.findById(existing.getId()).orElseThrow();
    }

    private Enrollment create(Long studentId, Long courseId, Long actorId, String reason) {
        Enrollment enrollment;
        try {
            enrollment = enrollmentRepository.saveAndFlush(new Enrollment(studentId, courseId));
        } catch (DataIntegrityViolationException ex) {
            throw EnrollmentException.conflict("ALREADY_ENROLLED",
                    "Student " + studentId + " is already enrolled in course " + courseId);
        }
        enrollmentHistoryRepository.save(EnrollmentHistory.initial(enrollment.getId(), actorId, reason));
        return enrollment;
    }
}
