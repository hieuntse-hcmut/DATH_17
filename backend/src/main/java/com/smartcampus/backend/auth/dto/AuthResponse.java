package com.smartcampus.backend.auth.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String username
) {
}