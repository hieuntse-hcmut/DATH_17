package com.smartcampus.backend.progress.repository.projection;

/** A lesson with the course it belongs to (lessons -> chapters -> courses). */
public interface LessonContextView {
    Long getLessonId();
    String getLessonTitle();
    String getContentType();
    Long getCourseId();
    String getCourseTitle();
    String getPublicationState();
}
