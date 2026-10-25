package com.smartcampus.backend.course.controller;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.course.dto.CourseResponse;
import com.smartcampus.backend.course.dto.CreateCourseRequest;
import com.smartcampus.backend.course.dto.MyCourseResponse;
import com.smartcampus.backend.course.dto.UpdateCourseRequest;
import com.smartcampus.backend.course.service.CourseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@Validated
public class CourseController {
    private final CourseService service;

    public CourseController(CourseService service) {
        this.service = service;
    }

    /** Students only see PUBLISHED courses (filtered in CourseService). */
    @GetMapping
    public List<CourseResponse> findAll() {
        return service.findAll();
    }

    /** A student gets 404 for a course that is not PUBLISHED. */
    @GetMapping("/{id}")
    public CourseResponse findById(@PathVariable @Positive Long id) {
        return service.findById(id);
    }

    /** Only lecturers and admins create courses; the creator is the logged-in user. */
    @PostMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CreateCourseRequest request) {
        CourseResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/courses/" + response.id())).body(response);
    }

    /** Only the course's lecturer (created_by or course_lecturers) or an admin (checked in CourseService). */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public CourseResponse update(@PathVariable @Positive Long id,
                                 @Valid @RequestBody UpdateCourseRequest request) {
        return service.update(id, request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER')")
    public ApiResponse<List<MyCourseResponse>> getMyCourses(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ApiResponse.ok(
                service.getMyCourses(currentUser)
        );
    }
}
