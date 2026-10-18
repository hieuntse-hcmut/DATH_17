package com.smartcampus.backend.analytics.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Course-level statistics (FR-ANL-009): enrollments and completion. */
@Schema(description = "Enrollment and completion statistics of one course")
public record CourseAnalyticsResponse(
        @Schema(example = "9101") Long courseId,
        @Schema(example = "Introduction to Spring Boot") String courseTitle,
        @Schema(example = "PUBLISHED") String publicationState,
        @Schema(example = "true") boolean enrollmentOpen,

        @Schema(description = "Students currently enrolled (ACTIVE)", example = "40") long activeEnrollments,
        @Schema(description = "Students who left by themselves", example = "3") long withdrawnEnrollments,
        @Schema(description = "Students removed by staff", example = "1") long removedEnrollments,
        @Schema(description = "Every enrollment ever made (all statuses)", example = "44") long totalEnrollments,
        @Schema(description = "Enrollments created in the last 7 days", example = "5") long newEnrollmentsLast7Days,

        @Schema(description = "Lessons in the course", example = "12") long totalLessons,
        @Schema(description = "ACTIVE students who completed every lesson", example = "10") long studentsCompleted,
        @Schema(example = "25") long studentsInProgress,
        @Schema(example = "5") long studentsNotStarted,
        @Schema(description = "studentsCompleted / activeEnrollments x 100", example = "25.0") double completionRate,
        @Schema(description = "Average progress percent of ACTIVE students", example = "58.3") double averageProgressPercent
) {
}
