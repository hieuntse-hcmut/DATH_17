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

    @Operation(summary = "Mark a lesson as done",
            description = """
                    Manual "Mark as done" for content without pages/duration (plain text). Idempotent.
                    The student must have an ACTIVE enrollment in the lesson's course and the course must be PUBLISHED.
                    When the last lesson of the course is completed the student gets a COURSE_COMPLETED notification.

                    Errors: 404 LESSON_NOT_FOUND, 403 NOT_A_STUDENT / NOT_ENROLLED / COURSE_NOT_PUBLISHED.
                    """)
    @PostMapping("/api/lessons/{lessonId}/complete")
    public ApiResponse<LessonProgressResponse> markComplete(
            @Parameter(example = "9301", required = true) @PathVariable("lessonId") Long lessonId) {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(progressService.markLessonComplete(studentId, lessonId));
    }

    @Operation(summary = "Save the position reached in a lesson",
            description = """
                    Saves the resume position (seconds for video, pages for PDF/slides).
                    The lesson is completed automatically once position >= 90% of the lesson's total_length,
                    which the lecturer sets on the lesson (V5). A totalLength in the body is ignored.
                    A lesson without total_length only saves the position and is never auto-completed.
                    Completion never goes back to false. Send the furthest position reached, not the playhead.
                    A LESSON_PROGRESS learning activity is logged at most once every 15 seconds per lesson.

                    Errors: 400 VALIDATION_ERROR, 404 LESSON_NOT_FOUND, 403 NOT_A_STUDENT / NOT_ENROLLED / COURSE_NOT_PUBLISHED.
                    """)
    @PutMapping("/api/lessons/{lessonId}/progress")
    public ApiResponse<LessonProgressResponse> updatePosition(
            @Parameter(example = "9301", required = true) @PathVariable("lessonId") Long lessonId,
            @Valid @RequestBody UpdatePositionRequest request) {
        Long studentId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(progressService.updatePosition(studentId, lessonId, request));
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

