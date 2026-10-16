package com.smartcampus.backend.auth.controller;

import com.smartcampus.backend.auth.dto.AuthResponse;
import com.smartcampus.backend.auth.dto.LoginRequest;
import com.smartcampus.backend.auth.dto.RegisterRequest;
import org.springframework.http.HttpStatus;
import com.smartcampus.backend.auth.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}