package com.smartcampus.backend.learningcontent.dto;

public record LessonResponse(
        Long id,
        Long chapterId,
        String title,
        int orderIndex
) {}
