package com.smartcampus.backend.course.dto;

import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.entity.PublicationState;
import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        String title,
        String description,
        PublicationState publicationState,
        boolean enrollmentOpen,
        Long createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CourseResponse from(Course course) {
        return new CourseResponse(course.getId(), course.getTitle(), course.getDescription(),
                course.getPublicationState(), course.isEnrollmentOpen(), course.getCreatedBy(),
                course.getCreatedAt(), course.getUpdatedAt());
    }
}
