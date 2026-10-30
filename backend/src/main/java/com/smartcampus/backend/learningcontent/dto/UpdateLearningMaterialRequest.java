package com.smartcampus.backend.learningcontent.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateLearningMaterialRequest(
        @NotBlank String title,
        @NotBlank String fileUrl,
        @NotBlank String fileType
) {}
