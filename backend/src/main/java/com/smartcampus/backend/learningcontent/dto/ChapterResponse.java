package com.smartcampus.backend.learningcontent.dto;

public record ChapterResponse(
        Long id,
        Long courseId,
        String title,
        int orderIndex
) {}