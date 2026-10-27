
package com.smartcampus.backend.learningcontent.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.course.repository.CourseRepository;
import com.smartcampus.backend.learningcontent.dto.ChapterResponse;
import com.smartcampus.backend.learningcontent.dto.CreateChapterRequest;
import com.smartcampus.backend.learningcontent.dto.UpdateChapterRequest;
import com.smartcampus.backend.learningcontent.entity.Chapter;
import com.smartcampus.backend.learningcontent.repository.ChapterRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final CourseAccessService courseAccessService;

    public ChapterService(
            ChapterRepository chapterRepository,
            CourseRepository courseRepository,
            CourseAccessService courseAccessService
    ) {
        this.chapterRepository = chapterRepository;
        this.courseRepository = courseRepository;
        this.courseAccessService = courseAccessService;
    }

    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersByCourse(Long courseId, CustomUserDetails currentUser) {

        // Chỉ staff của khoá hoặc student có enrollment ACTIVE trong khoá PUBLISHED
        courseAccessService.requireViewPermission(courseId, currentUser);

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Course not found"
            );
        }

        return chapterRepository
                .findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ChapterResponse toResponse(Chapter chapter) {
        return new ChapterResponse(
                chapter.getId(),
                chapter.getCourseId(),
                chapter.getTitle(),
                chapter.getOrderIndex()
        );
    }


    @Transactional
    public ChapterResponse createChapter(
            Long courseId,
            CreateChapterRequest request,
            CustomUserDetails currentUser
    ) {
        // 1. Kiểm tra quyền quản lý Course
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        // 2. Kiểm tra trùng orderIndex
        if (chapterRepository.existsByCourseIdAndOrderIndex(
                courseId, request.orderIndex())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chapter order already exists"
            );
        }

        // 3. Tạo Chapter
        Chapter chapter = new Chapter(
                courseId,
                request.title().trim(),
                request.orderIndex()
        );

        // 4. Lưu database
        Chapter saved = chapterRepository.save(chapter);

        return toResponse(saved);
    }

    @Transactional
    public ChapterResponse updateChapter(
            Long courseId,
            Long chapterId,
            UpdateChapterRequest request,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(courseId, currentUser);
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
        boolean orderExists =
                chapterRepository.existsByCourseIdAndOrderIndexAndIdNot(
                        courseId,
                        request.orderIndex(),
                        chapterId
                );

        if (orderExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chapter order already exists"
            );
        }
        chapter.update(
                request.title().trim(),
                request.orderIndex()
        );
        return toResponse(chapter);
    }


    @Transactional
    public void deleteChapter(Long courseId, Long chapterId, CustomUserDetails currentUser)
    {
        courseAccessService.requireManagePermission(courseId, currentUser);
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

        chapterRepository.delete(chapter);
    }

}
