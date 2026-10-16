package com.smartcampus.backend.course.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_state", nullable = false, length = 30)
    private PublicationState publicationState;

    @Column(name = "is_enrollment_open", nullable = false)
    private boolean enrollmentOpen;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    @Generated(event = EventType.INSERT)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    private LocalDateTime updatedAt;

    protected Course() {}

    public Course(String title, String description, PublicationState publicationState,
                  boolean enrollmentOpen, Long createdBy) {
        this.title = title;
        this.description = description;
        this.publicationState = publicationState;
        this.enrollmentOpen = enrollmentOpen;
        this.createdBy = createdBy;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public PublicationState getPublicationState() { return publicationState; }
    public boolean isEnrollmentOpen() { return enrollmentOpen; }
    public Long getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void update(String title, String description, PublicationState publicationState,
                       boolean enrollmentOpen) {
        this.title = title;
        this.description = description;
        this.publicationState = publicationState;
        this.enrollmentOpen = enrollmentOpen;
    }
}
