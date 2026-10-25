
package com.smartcampus.backend.learningcontent.controller;


import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.learningcontent.dto.*;
import com.smartcampus.backend.learningcontent.service.ChapterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters")
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @GetMapping
    public List<ChapterResponse> getChapters(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return chapterService.getChaptersByCourse(courseId, currentUser);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @ResponseStatus(HttpStatus.CREATED)
    public ChapterResponse createChapter(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateChapterRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return chapterService.createChapter(
                courseId,
                request,
                currentUser
        );
    }

    @PutMapping("/{chapterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ChapterResponse updateChapter(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @Valid @RequestBody UpdateChapterRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return chapterService.updateChapter(
                courseId, chapterId, request, currentUser
        );
    }

    @DeleteMapping("/{chapterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChapter(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        chapterService.deleteChapter(
                courseId, chapterId, currentUser
        );
    }
}
