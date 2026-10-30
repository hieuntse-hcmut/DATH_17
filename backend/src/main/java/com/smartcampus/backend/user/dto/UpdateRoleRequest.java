package com.smartcampus.backend.user.dto;

import com.smartcampus.backend.user.entity.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull UserRole role
) {}