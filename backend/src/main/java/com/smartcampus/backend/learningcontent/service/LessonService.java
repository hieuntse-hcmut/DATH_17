
package com.smartcampus.backend.learningcontent.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.learningcontent.dto.*;
import com.smartcampus.backend.learningcontent.entity.Chapter;
import com.smartcampus.backend.learningcontent.entity.Lesson;
import com.smartcampus.backend.learningcontent.repository.ChapterRepository;
import com.smartcampus.backend.learningcontent.repository.LessonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class LessonService {

    /** Loại bài có độ dài đo được: VIDEO (giây), PDF (trang). TEXT không có totalLength. */
    static final Set<String> MEASURABLE_TYPES = Set.of("VIDEO", "PDF");

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CourseAccessService courseAccessService;

    public LessonService(
            LessonRepository lessonRepository,
            ChapterRepository chapterRepository,
            CourseAccessService courseAccessService
    ) {
        this.lessonRepository = lessonRepository;
        this.chapterRepository = chapterRepository;
        this.courseAccessService = courseAccessService;
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getLessons(
            Long courseId, Long chapterId, CustomUserDetails currentUser
    ) {
        courseAccessService.requireViewPermission(courseId, currentUser);
        requireChapter(courseId, chapterId);

        return lessonRepository
                .findByChapterIdOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LessonResponse createLesson(
            Long courseId,
            Long chapterId,
            CreateLessonRequest request,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        requireChapter(courseId, chapterId);

        if (lessonRepository.existsByChapterIdAndOrderIndex(
                chapterId, request.orderIndex())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Lesson order already exists"
            );
        }

        Lesson lesson = new Lesson(
                chapterId,
                request.title().trim(),
                request.contentType().trim(),
                request.orderIndex(),
                validTotalLength(request.contentType(), request.totalLength())
        );

        return toResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public LessonResponse updateLesson(
            Long courseId,
            Long chapterId,
            Long lessonId,
            UpdateLessonRequest request,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        requireChapter(courseId, chapterId);
        Lesson lesson = requireLesson(chapterId, lessonId);

        if (lessonRepository
                .existsByChapterIdAndOrderIndexAndIdNot(
                        chapterId,
                        request.orderIndex(),
                        lessonId
                )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Lesson order already exists"
            );
        }

        lesson.update(
                request.title().trim(),
                request.contentType().trim(),
                request.orderIndex(),
                validTotalLength(request.contentType(), request.totalLength())
        );

        return toResponse(lesson);
    }

    @Transactional
    public void deleteLesson(
            Long courseId,
            Long chapterId,
            Long lessonId,
            CustomUserDetails currentUser
    ) {
        courseAccessService.requireManagePermission(
                courseId, currentUser
        );

        requireChapter(courseId, chapterId);
        Lesson lesson = requireLesson(chapterId, lessonId);

        lessonRepository.delete(lesson);
    }

    private Chapter requireChapter(
            Long courseId, Long chapterId
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

        return chapter;
    }

    private Lesson requireLesson(
            Long chapterId, Long lessonId
    ) {
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

    /** totalLength chỉ có nghĩa với VIDEO/PDF; gửi kèm bài TEXT là sai dữ liệu (400). */
    static Integer validTotalLength(String contentType, Integer totalLength) {
        if (totalLength == null) {
            return null;
        }
        String type = contentType.trim().toUpperCase(Locale.ROOT);
        if (!MEASURABLE_TYPES.contains(type)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "totalLength chỉ dùng cho bài VIDEO (số giây) hoặc PDF (số trang)"
            );
        }
        return totalLength;
    }

    private LessonResponse toResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getChapterId(),
                lesson.getTitle(),
                lesson.getContentType(),
                lesson.getOrderIndex(),
                lesson.getTotalLength()
        );
    }
}
