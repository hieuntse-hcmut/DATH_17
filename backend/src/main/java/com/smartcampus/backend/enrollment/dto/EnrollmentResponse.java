package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;

import java.time.LocalDateTime;

public record EnrollmentResponse (
        Long enrollmentId,
        Long studentId,
        Long courseId,
        String courseTitle,
        EnrollmentStatus status,
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