package com.smartcampus.backend.user.controller;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.user.dto.UpdateRoleRequest;
import com.smartcampus.backend.user.dto.UserResponse;
import com.smartcampus.backend.user.service.UserService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                userService.getAllUsers(pageable)
        );
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(
                userService.updateRole(
                        id,
                        request,
                        currentUser.getId()
                )
        );
    }
}