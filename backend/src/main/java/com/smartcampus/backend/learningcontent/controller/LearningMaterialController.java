
package com.smartcampus.backend.learningcontent.controller;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.learningcontent.dto.*;
import com.smartcampus.backend.learningcontent.service.LearningMaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}/materials"
)
public class LearningMaterialController {

    private final LearningMaterialService materialService;

    public LearningMaterialController(
            LearningMaterialService materialService
    ) {
        this.materialService = materialService;
    }

    @GetMapping
    public List<LearningMaterialResponse> getMaterials(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return materialService.getMaterials(
                courseId, chapterId, lessonId, currentUser
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @ResponseStatus(HttpStatus.CREATED)
    public LearningMaterialResponse createMaterial(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateLearningMaterialRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return materialService.createMaterial(
                courseId, chapterId, lessonId,
                request, currentUser
        );
    }

    @PutMapping("/{materialId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public LearningMaterialResponse updateMaterial(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long materialId,
            @Valid @RequestBody UpdateLearningMaterialRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return materialService.updateMaterial(
                courseId, chapterId, lessonId,
                materialId, request, currentUser
        );
    }

    @DeleteMapping("/{materialId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMaterial(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long materialId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        materialService.deleteMaterial(
                courseId, chapterId, lessonId,
                materialId, currentUser
        );
    }
}
