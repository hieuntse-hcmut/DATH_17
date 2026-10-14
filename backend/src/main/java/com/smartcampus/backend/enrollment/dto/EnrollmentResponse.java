package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "The enrollment that was just created")
public record EnrollmentResponse(
        @Schema(description = "Id of the new enrollment", example = "1")
        Long enrollmentId,

        @Schema(description = "Id of the logged-in student (taken from the JWT)", example = "9001")
        Long studentId,

        @Schema(description = "Id of the course", example = "9101")
        Long courseId,

        @Schema(description = "Title of the course", example = "Introduction to Spring Boot")
        String courseTitle,

        @Schema(description = "Always ACTIVE for a new enrollment", example = "ACTIVE")
        EnrollmentStatus status,

        @Schema(description = "When the student enrolled (set by the database)", example = "2026-10-10T05:36:02")
        LocalDateTime enrolledAt
) {

    public static EnrollmentResponse of(Enrollment enrollment, CourseEnrollmentInfo course) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStudentId(),
                enrollment.getCourseId(),
                course.getTitle(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt()
        );
    }
}
