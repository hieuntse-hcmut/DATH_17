package com.smartcampus.backend.notification.entity;

/**
 * Notification vocabulary (BR-INT-001). Stored as VARCHAR(50) in notifications.type,
 * so a module can add a value here without a migration.
 */
public enum NotificationType {
    /** Enrollment: a lecturer/admin enrolled or reinstated the student. */
    ENROLLED_BY_STAFF,
    /** Enrollment: a lecturer/admin removed the student from a course. */
    REMOVED_FROM_COURSE,
    /** Learning Progress: the student completed every lesson of a course. */
    COURSE_COMPLETED,
    /** Learning Content: new lesson/material published. */
    NEW_CONTENT,
    /** Assessment: a deadline is approaching. */
    DEADLINE_REMINDER,
    /** Assessment: a submission has been graded. */
    GRADED,
    /** Discussion: someone replied in a thread the user follows. */
    FORUM_REPLY,
    /** Moderation action on the user's content. */
    MODERATION,
    /** Learning Analytics: lecturer intervention message. */
    INTERVENTION,
    /** Anything else. */
    SYSTEM
}
