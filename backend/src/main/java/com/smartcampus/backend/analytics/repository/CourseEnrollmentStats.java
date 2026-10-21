package com.smartcampus.backend.analytics.repository;

/** Enrollment counters of one course. */
public record CourseEnrollmentStats(
        Long courseId,
        String courseTitle,
        String publicationState,
        boolean enrollmentOpen,
        long activeEnrollments,
        long withdrawnEnrollments,
        long removedEnrollments,
        long totalEnrollments,
        long newEnrollmentsLast7Days
) {
}
