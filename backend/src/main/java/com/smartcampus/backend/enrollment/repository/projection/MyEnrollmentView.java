package com.smartcampus.backend.enrollment.repository.projection;

import java.time.LocalDateTime;

public interface MyEnrollmentView {
    Long getEnrollmentId();
    String getStatus();
    LocalDateTime getEnrolledAt();
    Long getCourseId();
    String getCourseTitle();
    String getCourseDescription();
    String getPublicationState();
}