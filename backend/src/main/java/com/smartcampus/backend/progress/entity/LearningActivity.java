package com.smartcampus.backend.progress.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;

/** Maps table learning_activities (V1): append-only event log for Learning Analytics (FR-PROG-005). */
@Entity
@Table(name = "learning_activities")
public class LearningActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, updatable = false)
    private Long studentId;

    @Column(name = "lesson_id", updatable = false)
    private Long lessonId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50, columnDefinition = "VARCHAR(50)", updatable = false)
    private LearningEventType eventType;

    /** Furthest position reached (seconds or pages), not the current playhead. */
    @Column(name = "current_position", updatable = false)
    private Integer currentPosition;

    @Column(name = "total_length", updatable = false)
    private Integer totalLength;

    @Generated
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected LearningActivity() {
        // for JPA
    }

    public LearningActivity(Long studentId, Long lessonId, LearningEventType eventType,
                            Integer currentPosition, Integer totalLength) {
        this.studentId = studentId;
        this.lessonId = lessonId;
        this.eventType = eventType;
        this.currentPosition = currentPosition;
        this.totalLength = totalLength;
    }

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public Long getLessonId() { return lessonId; }
    public LearningEventType getEventType() { return eventType; }
    public Integer getCurrentPosition() { return currentPosition; }
    public Integer getTotalLength() { return totalLength; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
