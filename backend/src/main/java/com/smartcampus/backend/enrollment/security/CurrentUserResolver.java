package com.smartcampus.backend.enrollment.security;

import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    public static final String USER_ID_HEADER = "X-User-Id";

    private final HttpServletRequest request;

    public CurrentUserResolver(HttpServletRequest request) {
        this.request = request;
    }

    public Long getCurrentUserId() {
        String raw = request.getHeader(USER_ID_HEADER);
        if (raw == null || raw.isBlank()) {
            throw EnrollmentException.unauthorized("Missing header " + USER_ID_HEADER);
        }
        try {
            return Long.valueOf(raw.trim());
        } catch (NumberFormatException ex) {
            throw EnrollmentException.unauthorized("Header " + USER_ID_HEADER + " must be a number");
        }
    }
}