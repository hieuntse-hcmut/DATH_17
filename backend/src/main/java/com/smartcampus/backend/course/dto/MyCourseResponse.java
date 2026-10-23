package com.smartcampus.backend.course.dto;

public record MyCourseResponse(
        Long id,
        String title,
        String instructorName,
        Double progressPercent,
        Long totalLesson,
        Long completeLesson
) {}