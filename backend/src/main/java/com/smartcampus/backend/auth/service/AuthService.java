package com.smartcampus.backend.auth.service;

import com.smartcampus.backend.auth.dto.AuthResponse;
import com.smartcampus.backend.auth.dto.CurrentUserResponse;
import com.smartcampus.backend.auth.dto.LoginRequest;
import com.smartcampus.backend.auth.dto.RegisterRequest;
import com.smartcampus.backend.user.entity.User;
import com.smartcampus.backend.user.entity.UserRole;
import com.smartcampus.backend.user.entity.UserStatus;
import com.smartcampus.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
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
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
    @Transactional
    public void register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        String fullName = request.fullName().trim();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username đã tồn tại");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã tồn tại");
        }

        User user = new User(username, passwordEncoder.encode(request.password()),
                fullName, email, UserRole.STUDENT, UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(
            CustomUserDetails currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return CurrentUserResponse.from(user);
    }


}