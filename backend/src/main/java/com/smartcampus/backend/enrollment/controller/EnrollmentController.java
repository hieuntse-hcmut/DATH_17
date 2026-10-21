package com.smartcampus.backend.enrollment.controller;

import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentHistoryResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.EnrollmentStatusResponse;
import com.smartcampus.backend.enrollment.dto.MyEnrollmentResponse;
import com.smartcampus.backend.enrollment.dto.ReasonRequest;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import com.smartcampus.backend.enrollment.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.List;

@Tag(name = "Enrollment", description = "Student enrollment in courses")
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
            summary = "Enroll the logged-in student in a course",
            description = """
                    Only an ACTIVE user with role STUDENT may call this. The student is taken
                    from the JWT, never from the request.

                    Rules:
                    - the course exists
                    - the course is PUBLISHED
                    - the course is open for enrollment (is_enrollment_open = true)
                    - one enrollment per student and course (also enforced by a DB unique key)

                    No enrollment yet -> a new ACTIVE enrollment is created.
                    A WITHDRAWN enrollment is reactivated (same record, history kept).
                    A REMOVED student gets 403 ENROLLMENT_REMOVED: only the lecturer/admin can reinstate him.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "Enrolled",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(name = "Created", value = EnrollmentApiExamples.ENROLL_CREATED))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Course not published, enrollment closed, or invalid course id",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = {
                                    @ExampleObject(name = "COURSE_NOT_PUBLISHED", value = EnrollmentApiExamples.COURSE_NOT_PUBLISHED),
                                    @ExampleObject(name = "ENROLLMENT_CLOSED", value = EnrollmentApiExamples.ENROLLMENT_CLOSED),
                                    @ExampleObject(name = "INVALID_PARAMETER", value = EnrollmentApiExamples.INVALID_PARAMETER)
                            })),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403", description = "The user is not a STUDENT, the account is INACTIVE, or the student was REMOVED from this course (ENROLLMENT_REMOVED)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = {
                                    @ExampleObject(name = "NOT_A_STUDENT", value = EnrollmentApiExamples.NOT_A_STUDENT),
                                    @ExampleObject(name = "ACCOUNT_INACTIVE", value = EnrollmentApiExamples.ACCOUNT_INACTIVE)
                            })),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "Course does not exist",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(name = "COURSE_NOT_FOUND", value = EnrollmentApiExamples.COURSE_NOT_FOUND))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409", description = "The student is already enrolled in this course",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(name = "ALREADY_ENROLLED", value = EnrollmentApiExamples.ALREADY_ENROLLED)))
    })
    @PostMapping("/api/courses/{courseId}/enroll")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @Parameter(description = "Id of the course to enroll in", example = "9101", required = true)
            @PathVariable("courseId") Long courseId) {
        Long studentId = currentUserResolver.getCurrentUserId();
        EnrollmentResponse response = enrollmentService.enroll(studentId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
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
                    ACTIVE -> WITHDRAWN for the student in the JWT. The record and its history are kept,
                    and the student can enroll again later while the enrollment window is open.

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
