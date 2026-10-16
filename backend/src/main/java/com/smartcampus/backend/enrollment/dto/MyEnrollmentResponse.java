package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.repository.projection.MyEnrollmentView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/** One item of GET /api/enrollments/me */
@Schema(description = "A course the logged-in student is enrolled in")
public record MyEnrollmentResponse(
        @Schema(description = "Id of the enrollment", example = "1")
        Long enrollmentId,

        @Schema(description = "Id of the course", example = "9101")
        Long courseId,

        @Schema(description = "Title of the course", example = "Introduction to Spring Boot")
        String courseTitle,

        @Schema(description = "Description of the course", example = "Build REST APIs with Spring Boot", nullable = true)
        String courseDescription,

        @Schema(description = "DRAFT, PUBLISHED or ARCHIVED", example = "PUBLISHED")
        String publicationState,

        @Schema(description = "Only ACTIVE enrollments are listed", example = "ACTIVE")
        EnrollmentStatus status,

        @Schema(description = "When the student enrolled", example = "2026-10-10T05:36:02")
        LocalDateTime enrolledAt
) {

    public static MyEnrollmentResponse of(MyEnrollmentView view) {
        return new MyEnrollmentResponse(
                view.getEnrollmentId(),
                view.getCourseId(),
                view.getCourseTitle(),
                view.getCourseDescription(),
                view.getPublicationState(),
                EnrollmentStatus.valueOf(view.getStatus()),
                view.getEnrolledAt()
        );
    }
}
