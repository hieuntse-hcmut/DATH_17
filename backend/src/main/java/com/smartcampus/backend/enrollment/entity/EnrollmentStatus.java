package com.smartcampus.backend.enrollment.entity;

/**
 * docs/01-requirements/03-enrollment.md §3.1 (DB check added by V2__enrollment_status_withdrawn_removed.sql).
 *
 *   ACTIVE    -> WITHDRAWN  Student (own enrollment)
 *   ACTIVE    -> REMOVED    assigned Lecturer, Administrator
 *   WITHDRAWN -> ACTIVE     Student, assigned Lecturer, Administrator (window open, or admin override)
 *   REMOVED   -> ACTIVE     assigned Lecturer, Administrator only
 */
public enum EnrollmentStatus {
    ACTIVE,
    WITHDRAWN,
    REMOVED
}
