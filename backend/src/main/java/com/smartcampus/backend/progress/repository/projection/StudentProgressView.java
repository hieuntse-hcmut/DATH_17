package com.smartcampus.backend.progress.repository.projection;

import java.time.LocalDateTime;

/** One ACTIVE student of a course with progress counters (lecturer view, analytics). */
public interface StudentProgressView {
    Long getStudentId();
    String getUsername();
    String getFullName();
    Long getCompletedLessons();
    LocalDateTime getLastAccessedAt();
}
