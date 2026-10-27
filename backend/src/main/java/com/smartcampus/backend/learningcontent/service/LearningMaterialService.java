
package com.smartcampus.backend.learningcontent.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.learningcontent.dto.*;
import com.smartcampus.backend.learningcontent.entity.*;
import com.smartcampus.backend.learningcontent.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LearningMaterialService {

    private final LearningMaterialRepository materialRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CourseAccessService courseAccessService;

    public LearningMaterialService(
            LearningMaterialRepository materialRepository,
            LessonRepository lessonRepository,
            ChapterRepository chapterRepository,
            CourseAccessService courseAccessService
    ) {
        this.materialRepository = materialRepository;
        this.lessonRepository = lessonRepository;
        this.chapterRepository = chapterRepository;
        this.courseAccessService = courseAccessService;
    }

    @Transactional(readOnly = true)
    public List<LearningMaterialResponse> getMaterials(
            Long courseId,
            Long chapterId,
            Long lessonId,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireViewPermission(courseId, currentUser);
        requireLesson(courseId, chapterId, lessonId);

        return materialRepository
                .findByLessonIdOrderByIdAsc(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LearningMaterialResponse createMaterial(
            Long courseId,
            Long chapterId,
            Long lessonId,
            CreateLearningMaterialRequest request,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        requireLesson(courseId, chapterId, lessonId);

        LearningMaterial material = new LearningMaterial(
                lessonId,
                request.title().trim(),
                request.fileUrl().trim(),
                request.fileType().trim()
        );

        return toResponse(materialRepository.save(material));
    }

    @Transactional
    public LearningMaterialResponse updateMaterial(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long materialId,
            UpdateLearningMaterialRequest request,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        requireLesson(courseId, chapterId, lessonId);

        LearningMaterial material =
                requireMaterial(lessonId, materialId);

        material.update(
                request.title().trim(),
                request.fileUrl().trim(),
                request.fileType().trim()
        );

        return toResponse(material);
    }

    @Transactional
    public void deleteMaterial(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long materialId,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        requireLesson(courseId, chapterId, lessonId);

        LearningMaterial material =
                requireMaterial(lessonId, materialId);

        materialRepository.delete(material);
    }

    private Lesson requireLesson(
            Long courseId,
            Long chapterId,
            Long lessonId
    ) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Chapter not found"
                ));

        if (!chapter.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Chapter not found in this course"
            );
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lesson not found"
                ));

        if (!lesson.getChapterId().equals(chapterId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Lesson not found in this chapter"
            );
        }

        return lesson;
    }

    private LearningMaterial requireMaterial(
            Long lessonId,
            Long materialId
    ) {
        LearningMaterial material =
                materialRepository.findById(materialId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Learning material not found"
                        ));

        if (!material.getLessonId().equals(lessonId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Material not found in this lesson"
            );
        }

        return material;
    }

    private LearningMaterialResponse toResponse(
            LearningMaterial material
    ) {
        return new LearningMaterialResponse(
                material.getId(),
                material.getLessonId(),
                material.getTitle(),
                material.getFileUrl(),
                material.getFileType()
        );
    }
}
