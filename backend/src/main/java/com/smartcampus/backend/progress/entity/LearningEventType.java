package com.smartcampus.backend.progress.entity;

/**
 * learning_activities.event_type vocabulary (database-conventions.md §11: defined centrally in Java).
 * Consumed by Learning Analytics (07).
 */
public enum LearningEventType {
    /** Position update for a lesson (video seconds / PDF pages); throttled to 1 write per 15 s. */
    LESSON_PROGRESS,
    /** The lesson became complete (manual "Mark as done" or the 90% threshold). */
    LESSON_COMPLETED
}
