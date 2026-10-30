package com.smartcampus.backend.progress.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_material_progress", uniqueConstraints =
@UniqueConstraint(name = "uk_material_progress_student_material", columnNames = {"student_id", "material_id"}))
public class LearningMaterialProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "student_id", nullable = false, updatable = false)
    private Long studentId;
    @Column(name = "material_id", nullable = false, updatable = false)
    private Long materialId;
    @Column(name = "is_completed", nullable = false)
    private boolean completed;
    @Column(name = "last_position", nullable = false)
    private int lastPosition;
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected LearningMaterialProgress() {}
    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public Long getMaterialId() { return materialId; }
    public boolean isCompleted() { return completed; }
    public int getLastPosition() { return lastPosition; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
