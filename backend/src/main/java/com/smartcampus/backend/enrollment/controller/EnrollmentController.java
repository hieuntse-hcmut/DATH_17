package com.smartcampus.backend.enrollment.controller;

import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentHistoryResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.ReasonRequest;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import com.smartcampus.backend.enrollment.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.List;

/**
 * Student side of Enrollment: my courses, withdraw, history.
 * Students cannot enroll themselves; the course's lecturer or an administrator adds them
 * through POST /api/courses/{courseId}/enrollments (CourseEnrollmentController).
 */
@Tag(name = "Enrollment", description = "A student's own enrollments (students are added by the lecturer or an admin)")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@RestController
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final CurrentUserResolver currentUserResolver;

    public EnrollmentController(EnrollmentService enrollmentService,
                                CurrentUserResolver currentUserResolver) {
        this.enrollmentService = enrollmentService;
        this.currentUserResolver = currentUserResolver;
    }

    @Operation(
            summary = "List the courses the logged-in student is enrolled in",
            description = """
                    Returns only ACTIVE enrollments of the student in the JWT, newest first.
                    Returns an empty list when the student has no enrollment.
                    A student can never see another student's enrollments.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Enrolled courses (may be empty)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = {
                                    @ExampleObject(name = "With enrollments", value = EnrollmentApiExamples.MY_ENROLLMENTS_OK),
                                    @ExampleObject(name = "No enrollment", value = EnrollmentApiExamples.MY_ENROLLMENTS_EMPTY)
                            })),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403", description = "The user is not a STUDENT (when the STUDENT-only security rule is enabled)",
                    content = @Content)
    })
    @GetMapping("/api/enrollments/me")
    public ApiResponse<List<MyEnrollmentResponse>> getMyEnrollments() {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(enrollmentService.getMyEnrollments(studentId));
    }

    @Operation(
            summary = "Withdraw the logged-in student from a course",
            description = """
                    ACTIVE -> WITHDRAWN for the student in the JWT. The record and its history are kept.
                    Only the course's lecturer or an administrator can add the student back.

                    Errors: 404 NOT_ENROLLED, 409 ENROLLMENT_NOT_ACTIVE (already withdrawn or removed),
                    403 NOT_A_STUDENT. The body is optional: {"reason": "..."}.
                    """)
    @PostMapping("/api/courses/{courseId}/withdraw")
    public ApiResponse<EnrollmentStatusResponse> withdraw(
            @Parameter(description = "Id of the course to leave", example = "9101", required = true)
            @PathVariable("courseId") Long courseId,
            @Valid @RequestBody(required = false) ReasonRequest body) {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(enrollmentService.withdraw(studentId, courseId, body == null ? null : body.reason()));
    }

    @Operation(
            summary = "Status history of an enrollment",
            description = """
                    Append-only list of status changes, oldest first. Visible to the student who owns
                    the enrollment and to the course's lecturer/admin.

                    Errors: 404 ENROLLMENT_NOT_FOUND, 403 NOT_ALLOWED.
                    """)
    @GetMapping("/api/enrollments/{enrollmentId}/history")
    public ApiResponse<List<EnrollmentHistoryResponse>> getHistory(
            @Parameter(example = "1", required = true) @PathVariable("enrollmentId") Long enrollmentId) {
        Long userId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(enrollmentService.getHistory(userId, enrollmentId));
    }
}

