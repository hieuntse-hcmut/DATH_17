package com.smartcampus.backend.enrollment.repository.projection;

public interface CourseEnrollmentInfo {
    Long getId();
    String getTitle();
    String getPublicationState();
    String getEnrollmentWindow();
}