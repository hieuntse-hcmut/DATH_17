package com.smartcampus.backend.progress.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.LocalDateTime;

/**
 * Maps table learning_progress (V1): one row per (student, lesson).
 * Rows are written only by the upsert queries in LearningProgressRepository,
 * which keep the unique key uk_learning_progress_student_lesson safe under concurrency.
 *
 * last_position unit: seconds for video, pages for PDF/slides, 0 for plain text (BR-PROG-003).
 */
@Entity
@Table(name = "learning_progress")
public class LearningProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, updatable = false)
    private Long studentId;

    @Column(name = "lesson_id", nullable = false, updatable = false)
    private Long lessonId;

    @Column(name = "is_completed", nullable = false)
    private boolean completed;

    @Column(name = "last_position", nullable = false)
    private int lastPosition;

    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected LearningProgress() {
        // for JPA
    }

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public Long getLessonId() { return lessonId; }
    public boolean isCompleted() { return completed; }
    public int getLastPosition() { return lastPosition; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
