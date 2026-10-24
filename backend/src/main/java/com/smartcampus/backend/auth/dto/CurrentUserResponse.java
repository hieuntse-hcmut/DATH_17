package com.smartcampus.backend.auth.dto;

import com.smartcampus.backend.user.entity.User;

public record CurrentUserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String role
) {
    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}