package com.smartcampus.backend.enrollment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, updatable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false, updatable = false)
    private Long courseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30, columnDefinition = "VARCHAR(30)")
    private EnrollmentStatus status;

    @Generated
    @Column(name = "enrolled_at", insertable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected Enrollment() {
        // for JPA
    }

    public Enrollment(Long studentId, Long courseId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.status = EnrollmentStatus.ACTIVE;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}