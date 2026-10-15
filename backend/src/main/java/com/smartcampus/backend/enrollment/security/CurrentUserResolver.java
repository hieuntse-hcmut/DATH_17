package com.smartcampus.backend.enrollment.security;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    private final EnrollmentRepository enrollmentRepository;

    public CurrentUserResolver(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw EnrollmentException.unauthorized("Please log in");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof CustomUserDetails user) {
            return user.getId();
        }

        if (principal instanceof Long userId) {
            return userId;
        }

        return enrollmentRepository.findUserIdByLogin(auth.getName())
                .orElseThrow(() -> EnrollmentException.unauthorized("Logged-in user not found"));
    }
}