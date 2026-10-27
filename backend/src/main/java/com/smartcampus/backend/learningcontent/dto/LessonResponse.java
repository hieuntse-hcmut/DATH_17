package com.smartcampus.backend.learningcontent.dto;

public record LessonResponse(
        Long id,
        Long chapterId,
        String title,
        String contentType,
        int orderIndex,
        /** giây (VIDEO) hoặc số trang (PDF); null nếu chưa có */
        Integer totalLength
) {}
