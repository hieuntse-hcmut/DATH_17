package com.smartcampus.backend.learningcontent.dto;

public record LearningMaterialResponse(
        Long id,
        Long lessonId,
        String title,
        String fileUrl,
        String fileType
) {}
