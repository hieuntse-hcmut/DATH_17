package com.smartcampus.backend.enrollment.controller;

import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.dto.EnrollStudentRequest;
import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.dto.ReasonRequest;
import com.smartcampus.backend.enrollment.dto.RosterEntryResponse;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import com.smartcampus.backend.enrollment.service.EnrollmentManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Roster management for the course's lecturer (created_by or course_lecturers) and administrators.
 * Lives in the enrollment module, not in CourseController, so modules never edit the same file.
 */
@Tag(name = "Enrollment management", description = "Roster, enroll and remove students (assigned lecturer or admin)")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@RestController
public class CourseEnrollmentController {

    private final EnrollmentManagementService managementService;
    private final CurrentUserResolver currentUserResolver;

    public CourseEnrollmentController(EnrollmentManagementService managementService,
                                      CurrentUserResolver currentUserResolver) {
        this.managementService = managementService;
        this.currentUserResolver = currentUserResolver;
    }

    @Operation(summary = "Course roster",
            description = """
                    ACTIVE enrollments by default. includeInactive=true also lists WITHDRAWN and REMOVED.
                    Each row shows the enrollment status, the latest status change and the student's account status.

                    Errors: 404 COURSE_NOT_FOUND, 403 NOT_COURSE_STAFF.
                    """)
    @GetMapping("/api/courses/{courseId}/enrollments")
    public ApiResponse<List<RosterEntryResponse>> getRoster(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId,
            @Parameter(example = "false") @RequestParam(name = "includeInactive", defaultValue = "false")
            boolean includeInactive) {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(managementService.getRoster(actorId, courseId, includeInactive));
    }

    @Operation(summary = "Enroll or reinstate a student",
            description = """
                    Creates an ACTIVE enrollment, or reinstates a WITHDRAWN/REMOVED one (same record).
                    The enrollment window must be open. When it is closed, only an ADMIN may set
                    adminOverride=true with a reason; the override is written to enrollment_histories and audit_logs.
                    The student receives an ENROLLED_BY_STAFF notification.

                    Errors: 404 COURSE_NOT_FOUND / STUDENT_NOT_FOUND, 403 NOT_COURSE_STAFF / OVERRIDE_NOT_ALLOWED,
                    400 NOT_A_STUDENT / STUDENT_INACTIVE / ENROLLMENT_CLOSED / OVERRIDE_REASON_REQUIRED / VALIDATION_ERROR,
                    409 ALREADY_ENROLLED.
                    """)
    @PostMapping("/api/courses/{courseId}/enrollments")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollStudent(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId,
            @Valid @RequestBody EnrollStudentRequest request) {
        Long actorId = currentUserResolver.getCurrentUserId();
        EnrollmentResponse response = managementService.enrollStudent(actorId, courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "Remove a student from a course",
            description = """
                    ACTIVE -> REMOVED. Writes enrollment_histories and audit_logs, and sends the student
                    a REMOVED_FROM_COURSE notification. Learning data is kept. Body is optional: {"reason": "..."}.

                    Errors: 404 COURSE_NOT_FOUND / NOT_ENROLLED, 403 NOT_COURSE_STAFF, 409 ENROLLMENT_NOT_ACTIVE.
                    """)
    @PostMapping("/api/courses/{courseId}/enrollments/{studentId}/remove")
    public ApiResponse<EnrollmentStatusResponse> removeStudent(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId,
            @Parameter(example = "9001", required = true) @PathVariable("studentId") Long studentId,
            @Valid @RequestBody(required = false) ReasonRequest body) {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(managementService.removeStudent(actorId, courseId, studentId,
                body == null ? null : body.reason()));
    }
}
