package com.smartcampus.backend.learningcontent.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateLearningMaterialRequest(
        @NotBlank String title,
        @NotBlank String fileUrl,
        @NotBlank String fileType
) {}
