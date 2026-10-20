package com.smartcampus.backend.progress.dto;

/** Grouping for "My Courses" (FR-PROG-004). */
public enum ProgressStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED;

    public static ProgressStatus of(long completedLessons, long totalLessons, boolean everAccessed) {
        if (totalLessons > 0 && completedLessons >= totalLessons) {
            return COMPLETED;
        }
        if (completedLessons == 0 && !everAccessed) {
            return NOT_STARTED;
        }
        return IN_PROGRESS;
    }

    /** BR-PROG-002: completed / total x 100, one decimal; 0 when the course has no lesson. */
    public static double percent(long completedLessons, long totalLessons) {
        if (totalLessons <= 0) {
            return 0.0;
        }
        return Math.round(completedLessons * 1000.0 / totalLessons) / 10.0;
    }
}
