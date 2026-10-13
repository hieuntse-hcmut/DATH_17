package com.smartcampus.backend.enrollment.dto;

import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.repository.projection.MyEnrollmentView;

import java.time.LocalDateTime;

public record MyEnrollmentResponse(
        Long enrollmentId,
        Long courseId,
        String courseTitle,
        String courseDescription,
        String publicationState,
        EnrollmentStatus status,
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