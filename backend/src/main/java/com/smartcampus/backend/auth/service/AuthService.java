package com.smartcampus.backend.auth.service;

import com.smartcampus.backend.auth.dto.AuthResponse;
import com.smartcampus.backend.auth.dto.LoginRequest;
import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.auth.security.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final long expirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.expirationMs = expirationMs;
    }

    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.username(),
                                request.password()
                        )
                );

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        String accessToken = jwtService.generateToken(userDetails);

        return new AuthResponse(
                accessToken,
                "Bearer",
                expirationMs / 1000,
                userDetails.getId(),
                userDetails.getUsername()
        );
    }
}