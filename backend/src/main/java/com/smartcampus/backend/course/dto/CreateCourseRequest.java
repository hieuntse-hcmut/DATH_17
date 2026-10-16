package com.smartcampus.backend.course.dto;

import com.smartcampus.backend.course.entity.PublicationState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        PublicationState publicationState,
        Boolean enrollmentOpen,
        @NotNull @Positive Long createdBy
) {}
