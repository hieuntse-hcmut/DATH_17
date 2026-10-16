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

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollment_histories")
public class EnrollmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enrollment_id", nullable = false, updatable = false)
    private Long enrollmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30, columnDefinition = "VARCHAR(30)", updatable = false)
    private EnrollmentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30, columnDefinition = "VARCHAR(30)", updatable = false)
    private EnrollmentStatus newStatus;

    @Column(name = "changed_by", nullable = false, updatable = false)
    private Long changedBy;

    @Column(name = "reason", columnDefinition = "TEXT", updatable = false)
    private String reason;

    @Generated
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected EnrollmentHistory() {
        // for JPA
    }

    public EnrollmentHistory(Long enrollmentId, EnrollmentStatus previousStatus, EnrollmentStatus newStatus, Long changedBy, String reason) {
        this.enrollmentId = enrollmentId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    public static EnrollmentHistory initial(Long enrollmentId, Long changedBy, String reason) {
        return new EnrollmentHistory(enrollmentId, null, EnrollmentStatus.ACTIVE, changedBy, reason);
    }

    public Long getId() {
        return id;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public EnrollmentStatus getPreviousStatus () {
        return previousStatus;
    }

    public EnrollmentStatus getNewStatus() {
        return  newStatus;
    }

    public Long getChangedBy() {
        return changedBy;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}