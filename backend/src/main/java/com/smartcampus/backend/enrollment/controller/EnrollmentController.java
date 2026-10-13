package com.smartcampus.backend.enrollment.controller;

import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import com.smartcampus.backend.enrollment.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final CurrentUserResolver currentUserResolver;

    public EnrollmentController(EnrollmentService enrollmentService,
                                CurrentUserResolver currentUserResolver) {
        this.enrollmentService = enrollmentService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping("/api/courses/{courseId}/enroll")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(@PathVariable("courseId") Long courseId) {
        Long studentId = currentUserResolver.getCurrentUserId();
        EnrollmentResponse response = enrollmentService.enroll(studentId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping("/api/enrollments/me")
    public ApiResponse<List<MyEnrollmentResponse>> getMyEnrollments() {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(enrollmentService.getMyEnrollments(studentId));
    }
}
