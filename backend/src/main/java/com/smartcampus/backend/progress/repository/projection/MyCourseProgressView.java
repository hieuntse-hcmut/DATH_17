package com.smartcampus.backend.progress.repository.projection;

import java.time.LocalDateTime;

/** One ACTIVE enrollment of a student with progress counters. */
public interface MyCourseProgressView {
    Long getCourseId();
    String getCourseTitle();
    String getInstructorName();
    LocalDateTime getEnrolledAt();
    Long getTotalLessons();
    Long getCompletedLessons();
    LocalDateTime getLastAccessedAt();
    Long getLastLessonId();
    String getLastLessonTitle();
}
