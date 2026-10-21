package com.smartcampus.backend.enrollment.repository.projection;

import java.time.LocalDateTime;

/** One row of a course roster (FR-ENROLL-004). */
public interface RosterEntryView {
    Long getEnrollmentId();
    Long getStudentId();
    String getUsername();
    String getFullName();
    String getEmail();
    String getAccountStatus();
    String getStatus();
    LocalDateTime getEnrolledAt();
    LocalDateTime getStatusChangedAt();
}
