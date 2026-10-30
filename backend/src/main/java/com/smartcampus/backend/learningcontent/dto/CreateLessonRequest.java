package com.smartcampus.backend.learningcontent.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateLessonRequest(
        @NotBlank String title,
        @Min(0) int orderIndex
) {}
