package com.smartcampus.backend.learningcontent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record UpdateLearningMaterialRequest(
        @NotBlank String title,
        @NotBlank String fileUrl,
        @NotBlank String fileType,
        @Positive Integer totalLength
) {}