package com.smartcampus.backend.progress.controller;

import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import com.smartcampus.backend.progress.dto.CourseProgressResponse;
import com.smartcampus.backend.progress.dto.LessonProgressResponse;
import com.smartcampus.backend.progress.dto.MyCourseProgressResponse;
import com.smartcampus.backend.progress.dto.StudentProgressResponse;
import com.smartcampus.backend.progress.dto.UpdatePositionRequest;
import com.smartcampus.backend.progress.service.LearningProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Learning Progress", description = "Lesson completion, resume position and course progress")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@RestController
public class LearningProgressController {

    private final LearningProgressService progressService;
    private final CurrentUserResolver currentUserResolver;

    public LearningProgressController(LearningProgressService progressService,
                                      CurrentUserResolver currentUserResolver) {
        this.progressService = progressService;
        this.currentUserResolver = currentUserResolver;
    }

    @Operation(summary = "Update VIDEO material progress")
    @PutMapping("/api/materials/{materialId}/progress")
    public ApiResponse<LessonProgressResponse> updateMaterialPosition(
            @PathVariable Long materialId, @Valid @RequestBody UpdatePositionRequest request) {
        return ApiResponse.ok(progressService.updateMaterialPosition(currentUserResolver.getCurrentUserId(), materialId, request));
    }

    @Operation(summary = "Download a non-video material and record completion")
    @GetMapping("/api/materials/{materialId}/download")
    public org.springframework.http.ResponseEntity<Void> downloadMaterial(@PathVariable Long materialId) {
        String url = progressService.accessMaterial(currentUserResolver.getCurrentUserId(), materialId, false);
        return org.springframework.http.ResponseEntity.status(302)
                .location(java.net.URI.create(url)).build();
    }

    @Operation(summary = "Open a LINK material and record completion")
    @GetMapping("/api/materials/{materialId}/open")
    public org.springframework.http.ResponseEntity<Void> openMaterial(@PathVariable Long materialId) {
        String url = progressService.accessMaterial(currentUserResolver.getCurrentUserId(), materialId, true);
        return org.springframework.http.ResponseEntity.status(302)
                .location(java.net.URI.create(url)).build();
    }

    @Operation(summary = "My progress in one course",
            description = """
                    Lessons in display order with completed flag and resume position, the progress bar
                    (completed / total lessons) and the lesson to open on "Continue learning".

                    Errors: 404 COURSE_NOT_FOUND, 403 NOT_ENROLLED.
                    """)
    @GetMapping("/api/courses/{courseId}/progress/me")
    public ApiResponse<CourseProgressResponse> getMyCourseProgress(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId) {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(progressService.getMyCourseProgress(studentId, courseId));
    }

    @Operation(summary = "My Courses with progress",
            description = """
                    Every ACTIVE course of the logged-in student with completed/total lessons, percent,
                    status NOT_STARTED / IN_PROGRESS / COMPLETED and the last lesson accessed,
                    most recently accessed first.
                    """)
    @GetMapping("/api/progress/me")
    public ApiResponse<List<MyCourseProgressResponse>> getMyCourses() {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(progressService.getMyCourses(studentId));
    }

    @Operation(summary = "Progress of the whole class (lecturer/admin)",
            description = "Every ACTIVE student of the course with completed lessons and percent. "
                    + "Errors: 404 COURSE_NOT_FOUND, 403 NOT_COURSE_STAFF.")
    @GetMapping("/api/courses/{courseId}/progress")
    public ApiResponse<List<StudentProgressResponse>> getClassProgress(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId) {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(progressService.getClassProgress(actorId, courseId));
    }

    @Operation(summary = "One student's lesson-by-lesson progress (lecturer/admin)",
            description = "Errors: 404 COURSE_NOT_FOUND / NOT_ENROLLED, 403 NOT_COURSE_STAFF.")
    @GetMapping("/api/courses/{courseId}/progress/students/{studentId}")
    public ApiResponse<CourseProgressResponse> getStudentCourseProgress(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId,
            @Parameter(example = "9001", required = true) @PathVariable("studentId") Long studentId) {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(progressService.getStudentCourseProgress(actorId, courseId, studentId));
    }
}

