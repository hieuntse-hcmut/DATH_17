package com.smartcampus.backend.course.dto;

import com.smartcampus.backend.course.entity.PublicationState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCourseRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        @NotNull PublicationState publicationState,
        @NotNull Boolean enrollmentOpen
) {}
