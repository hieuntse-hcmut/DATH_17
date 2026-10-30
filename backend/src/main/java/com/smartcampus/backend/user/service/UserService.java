package com.smartcampus.backend.user.service;

import com.smartcampus.backend.user.dto.UserResponse;
import com.smartcampus.backend.user.dto.UpdateRoleRequest;
import com.smartcampus.backend.user.entity.User;
import com.smartcampus.backend.user.entity.UserRole;
import com.smartcampus.backend.user.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::from);
    }

    @Transactional
    public UserResponse updateRole(
            Long userId,
            UpdateRoleRequest request,
            Long currentAdminId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        // Không cho Admin tự sửa role của chính mình
        if (user.getId().equals(currentAdminId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot change your own role"
            );
        }

        // Không cho sửa role của Admin khác
        if (user.getRole() == UserRole.ADMIN) {
            throw new AccessDeniedException(
                    "Cannot change another admin's role"
            );
        }

        user.setRole(request.role());

        return UserResponse.from(user);
    }
}