
package com.smartcampus.backend.learningcontent.controller;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.learningcontent.dto.*;
import com.smartcampus.backend.learningcontent.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/courses/{courseId}/chapters/{chapterId}/lessons"
)
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping
    public List<LessonResponse> getLessons(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return lessonService.getLessons(courseId, chapterId, currentUser);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonResponse createLesson(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @Valid @RequestBody CreateLessonRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return lessonService.createLesson(
                courseId, chapterId, request, currentUser
        );
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public LessonResponse updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @Valid @RequestBody UpdateLessonRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return lessonService.updateLesson(
                courseId, chapterId, lessonId,
                request, currentUser
        );
    }

    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        lessonService.deleteLesson(
                courseId, chapterId, lessonId, currentUser
        );
    }
}
