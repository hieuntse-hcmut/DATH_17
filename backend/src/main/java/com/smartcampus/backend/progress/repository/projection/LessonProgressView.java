package com.smartcampus.backend.progress.repository.projection;

import java.time.LocalDateTime;

/** One lesson of a course with the student's progress (null fields = not started). */
public interface LessonProgressView {
    Long getLessonId();
    String getLessonTitle();
    Long getChapterId();
    String getChapterTitle();
    /** 1 = completed, 0 = not completed */
    Long getCompleted();
    Integer getLastPosition();
    LocalDateTime getLastAccessedAt();
}
