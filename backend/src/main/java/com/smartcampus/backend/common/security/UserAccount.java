package com.smartcampus.backend.common.security;

/** id, role and account status of a user, read from the users table. */
public record UserAccount(Long id, String role, String status, String fullName) {

    public static final String STUDENT = "STUDENT";
    public static final String LECTURER = "LECTURER";
    public static final String ADMIN = "ADMIN";

    public boolean isStudent() {
        return STUDENT.equals(role);
    }

    public boolean isLecturer() {
        return LECTURER.equals(role);
    }

    public boolean isAdmin() {
        return ADMIN.equals(role);
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }
}
