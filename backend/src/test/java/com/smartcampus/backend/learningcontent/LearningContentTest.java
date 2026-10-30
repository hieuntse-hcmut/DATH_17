package com.smartcampus.backend.learningcontent;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.repository.CourseRepository;
import com.smartcampus.backend.learningcontent.dto.*;
import com.smartcampus.backend.learningcontent.entity.*;
import com.smartcampus.backend.learningcontent.repository.*;
import com.smartcampus.backend.learningcontent.service.*;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningContentTest {

    private static void assertHttpStatus(
            HttpStatus status, Runnable action
    ) {
        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        action::run
                );

        assertEquals(status, exception.getStatusCode());
    }

    // ============================
    // CHAPTER TESTS
    // ============================

    @Nested
    class ChapterTests {

        @Mock ChapterRepository chapterRepository;
        @Mock CourseRepository courseRepository;
        @Mock CourseAccessService accessService;
        @Mock CustomUserDetails user;

        @InjectMocks ChapterService service;

        @Test
        void shouldListChaptersInOrder() {
            when(courseRepository.existsById(10L))
                    .thenReturn(true);

            Chapter chapter = mock(Chapter.class);
            when(chapter.getId()).thenReturn(1L);
            when(chapter.getCourseId()).thenReturn(10L);
            when(chapter.getTitle()).thenReturn("Introduction");

            when(chapterRepository
                    .findByCourseIdOrderByOrderIndexAsc(10L))
                    .thenReturn(List.of(chapter));

            List<ChapterResponse> result =
                    service.getChaptersByCourse(10L, user);

            assertEquals(1, result.size());
            assertEquals("Introduction", result.get(0).title());
        }

        @Test
        void shouldRejectMissingCourseOnList() {
            when(courseRepository.existsById(99L))
                    .thenReturn(false);

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.getChaptersByCourse(99L, user)
            );
        }

        @Test
        void shouldCreateChapter() {
            CreateChapterRequest request =
                    new CreateChapterRequest(" Introduction ", 0);

            when(chapterRepository.save(any(Chapter.class)))
                    .thenAnswer(invocation ->
                            invocation.getArgument(0));

            ChapterResponse result =
                    service.createChapter(10L, request, user);

            assertEquals("Introduction", result.title());
            assertEquals(10L, result.courseId());

            verify(accessService)
                    .requireManagePermission(10L, user);

            verify(chapterRepository)
                    .save(any(Chapter.class));
        }

        @Test
        void shouldRejectDuplicateChapterOrder() {
            when(chapterRepository
                    .existsByCourseIdAndOrderIndex(10L, 0))
                    .thenReturn(true);

            assertHttpStatus(
                    HttpStatus.CONFLICT,
                    () -> service.createChapter(
                            10L,
                            new CreateChapterRequest("A", 0),
                            user
                    )
            );

            verify(chapterRepository, never()).save(any());
        }

        @Test
        void shouldUpdateChapter() {
            Chapter chapter =
                    new Chapter(10L, "Old", 0);

            when(chapterRepository.findById(1L))
                    .thenReturn(Optional.of(chapter));

            ChapterResponse result =
                    service.updateChapter(
                            10L,
                            1L,
                            new UpdateChapterRequest("New", 2),
                            user
                    );

            assertEquals("New", result.title());
            assertEquals(2, result.orderIndex());

            verify(accessService)
                    .requireManagePermission(10L, user);
        }

        @Test
        void shouldRejectChapterFromAnotherCourse() {
            when(chapterRepository.findById(1L))
                    .thenReturn(Optional.of(
                            new Chapter(20L, "A", 0)
                    ));

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.updateChapter(
                            10L,
                            1L,
                            new UpdateChapterRequest("B", 1),
                            user
                    )
            );
        }

        @Test
        void shouldRejectDuplicateOrderOnUpdate() {
            when(chapterRepository.findById(1L))
                    .thenReturn(Optional.of(
                            new Chapter(10L, "A", 0)
                    ));

            when(chapterRepository
                    .existsByCourseIdAndOrderIndexAndIdNot(
                            10L, 2, 1L
                    ))
                    .thenReturn(true);

            assertHttpStatus(
                    HttpStatus.CONFLICT,
                    () -> service.updateChapter(
                            10L,
                            1L,
                            new UpdateChapterRequest("B", 2),
                            user
                    )
            );
        }

        @Test
        void shouldDeleteChapter() {
            Chapter chapter =
                    new Chapter(10L, "A", 0);

            when(chapterRepository.findById(1L))
                    .thenReturn(Optional.of(chapter));

            service.deleteChapter(10L, 1L, user);

            verify(accessService)
                    .requireManagePermission(10L, user);

            verify(chapterRepository).delete(chapter);
        }
    }

    // ============================
    // LESSON TESTS
    // ============================

    @Nested
    class LessonTests {

        @Mock LessonRepository lessonRepository;
        @Mock ChapterRepository chapterRepository;
        @Mock CourseAccessService accessService;
        @Mock CustomUserDetails user;

        @InjectMocks LessonService service;

        private void chapterExists() {
            when(chapterRepository.findById(2L))
                    .thenReturn(Optional.of(
                            new Chapter(10L, "Chapter", 0)
                    ));
        }

        @Test
        void shouldListLessons() {
            chapterExists();

            assertTrue(
                    service.getLessons(10L, 2L, user).isEmpty()
            );
        }

        @Test
        void shouldCreateLesson() {
            chapterExists();

            when(lessonRepository.save(any(Lesson.class)))
                    .thenAnswer(invocation ->
                            invocation.getArgument(0));

            LessonResponse result =
                    service.createLesson(
                            10L,
                            2L,
                            new CreateLessonRequest(
                                    " Java ", "VIDEO", 0, null
                            ),
                            user
                    );

            assertEquals("Java", result.title());
            assertEquals(2L, result.chapterId());

            verify(accessService)
                    .requireManagePermission(10L, user);
        }

        @Test
        void shouldStoreTotalLengthForVideoLesson() {
            chapterExists();

            when(lessonRepository.save(any(Lesson.class)))
                    .thenAnswer(invocation ->
                            invocation.getArgument(0));

            LessonResponse result =
                    service.createLesson(
                            10L,
                            2L,
                            new CreateLessonRequest(
                                    "Intro video", "VIDEO", 0, 600
                            ),
                            user
                    );

            assertEquals(600, result.totalLength());
        }

        @Test
        void shouldRejectTotalLengthForTextLesson() {
            chapterExists();

            assertHttpStatus(
                    HttpStatus.BAD_REQUEST,
                    () -> service.createLesson(
                            10L,
                            2L,
                            new CreateLessonRequest(
                                    "Reading", "TEXT", 0, 10
                            ),
                            user
                    )
            );

            verify(lessonRepository, never()).save(any());
        }

        @Test
        void shouldRejectDuplicateLessonOrder() {
            chapterExists();

            when(lessonRepository
                    .existsByChapterIdAndOrderIndex(2L, 0))
                    .thenReturn(true);

            assertHttpStatus(
                    HttpStatus.CONFLICT,
                    () -> service.createLesson(
                            10L,
                            2L,
                            new CreateLessonRequest(
                                    "A", "VIDEO", 0, null
                            ),
                            user
                    )
            );
        }

        @Test
        void shouldRejectChapterFromAnotherCourse() {
            when(chapterRepository.findById(2L))
                    .thenReturn(Optional.of(
                            new Chapter(99L, "A", 0)
                    ));

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.getLessons(10L, 2L, user)
            );
        }

        @Test
        void shouldUpdateLesson() {
            chapterExists();

            Lesson lesson =
                    new Lesson(2L, "Old", "PDF", 0);

            when(lessonRepository.findById(3L))
                    .thenReturn(Optional.of(lesson));

            LessonResponse result =
                    service.updateLesson(
                            10L,
                            2L,
                            3L,
                            new UpdateLessonRequest(
                                    "New", "VIDEO", 1, null
                            ),
                            user
                    );

            assertEquals("New", result.title());

            verify(accessService)
                    .requireManagePermission(10L, user);
        }

        @Test
        void shouldRejectLessonFromAnotherChapter() {
            chapterExists();

            when(lessonRepository.findById(3L))
                    .thenReturn(Optional.of(
                            new Lesson(9L, "A", "PDF", 0)
                    ));

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.updateLesson(
                            10L,
                            2L,
                            3L,
                            new UpdateLessonRequest(
                                    "B", "PDF", 1, null
                            ),
                            user
                    )
            );
        }

        @Test
        void shouldRejectDuplicateLessonOrderOnUpdate() {
            chapterExists();

            when(lessonRepository.findById(3L))
                    .thenReturn(Optional.of(
                            new Lesson(2L, "A", "PDF", 0)
                    ));

            when(lessonRepository
                    .existsByChapterIdAndOrderIndexAndIdNot(
                            2L, 1, 3L
                    ))
                    .thenReturn(true);

            assertHttpStatus(
                    HttpStatus.CONFLICT,
                    () -> service.updateLesson(
                            10L,
                            2L,
                            3L,
                            new UpdateLessonRequest(
                                    "B", "PDF", 1, null
                            ),
                            user
                    )
            );
        }

        @Test
        void shouldDeleteLesson() {
            chapterExists();

            Lesson lesson =
                    new Lesson(2L, "A", "PDF", 0);

            when(lessonRepository.findById(3L))
                    .thenReturn(Optional.of(lesson));

            service.deleteLesson(10L, 2L, 3L, user);

            verify(lessonRepository).delete(lesson);
        }
    }

    // ============================
    // LEARNING MATERIAL TESTS
    // ============================

    @Nested
    class MaterialTests {

        @Mock LearningMaterialRepository materialRepository;
        @Mock ChapterRepository chapterRepository;
        @Mock LessonRepository lessonRepository;
        @Mock CourseAccessService accessService;
        @Mock CustomUserDetails user;

        @InjectMocks LearningMaterialService service;

        private void lessonExists() {
            when(chapterRepository.findById(2L))
                    .thenReturn(Optional.of(
                            new Chapter(10L, "Chapter", 0)
                    ));

            when(lessonRepository.findById(3L))
                    .thenReturn(Optional.of(
                            new Lesson(2L, "Lesson", "VIDEO", 0)
                    ));
        }

        @Test
        void shouldListMaterials() {
            lessonExists();

            assertTrue(
                    service.getMaterials(10L, 2L, 3L, user).isEmpty()
            );
        }

        @Test
        void shouldCreateMaterial() {
            lessonExists();

            when(materialRepository.save(
                    any(LearningMaterial.class)
            )).thenAnswer(invocation ->
                    invocation.getArgument(0));

            LearningMaterialResponse result =
                    service.createMaterial(
                            10L,
                            2L,
                            3L,
                            new CreateLearningMaterialRequest(
                                    " Slides ",
                                    "https://example.com/slides.pdf",
                                    "PDF"
                            ),
                            user
                    );

            assertEquals("Slides", result.title());
            assertEquals(3L, result.lessonId());

            verify(accessService)
                    .requireManagePermission(10L, user);
        }

        @Test
        void shouldUpdateMaterial() {
            lessonExists();

            LearningMaterial material =
                    new LearningMaterial(
                            3L,
                            "Old",
                            "https://example.com/old",
                            "PDF"
                    );

            when(materialRepository.findById(4L))
                    .thenReturn(Optional.of(material));

            LearningMaterialResponse result =
                    service.updateMaterial(
                            10L,
                            2L,
                            3L,
                            4L,
                            new UpdateLearningMaterialRequest(
                                    "New",
                                    "https://example.com/new",
                                    "VIDEO"
                            ),
                            user
                    );

            assertEquals("New", result.title());
            assertEquals("VIDEO", result.fileType());
        }

        @Test
        void shouldRejectMaterialFromAnotherLesson() {
            lessonExists();

            when(materialRepository.findById(4L))
                    .thenReturn(Optional.of(
                            new LearningMaterial(
                                    99L,
                                    "A",
                                    "https://example.com",
                                    "PDF"
                            )
                    ));

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.updateMaterial(
                            10L,
                            2L,
                            3L,
                            4L,
                            new UpdateLearningMaterialRequest(
                                    "B",
                                    "https://example.com",
                                    "PDF"
                            ),
                            user
                    )
            );
        }

        @Test
        void shouldRejectLessonFromAnotherChapter() {
            when(chapterRepository.findById(2L))
                    .thenReturn(Optional.of(
                            new Chapter(10L, "A", 0)
                    ));

            when(lessonRepository.findById(3L))
                    .thenReturn(Optional.of(
                            new Lesson(99L, "B", "PDF", 0)
                    ));

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.getMaterials(10L, 2L, 3L, user)
            );
        }

        @Test
        void shouldDeleteMaterial() {
            lessonExists();

            LearningMaterial material =
                    new LearningMaterial(
                            3L,
                            "A",
                            "https://example.com",
                            "PDF"
                    );

            when(materialRepository.findById(4L))
                    .thenReturn(Optional.of(material));

            service.deleteMaterial(
                    10L, 2L, 3L, 4L, user
            );

            verify(materialRepository).delete(material);
        }
    }

    // ============================
    // AUTHORIZATION TESTS
    // ============================

    @Nested
    class AuthorizationTests {

        @Mock CourseRepository courseRepository;
        @Mock JdbcTemplate jdbcTemplate;
        @Mock CustomUserDetails user;

        @InjectMocks CourseAccessService service;

        @Test
        void shouldAllowAdmin() {
            Course course = mock(Course.class);

            when(courseRepository.findById(10L))
                    .thenReturn(Optional.of(course));

            when(user.getAuthorities()).thenAnswer(
                    invocation -> List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_ADMIN"
                            )
                    )
            );

            assertDoesNotThrow(
                    () -> service.requireManagePermission(
                            10L, user
                    )
            );
        }

        @Test
        void shouldAllowCourseOwnerLecturer() {
            Course course = mock(Course.class);

            when(course.getCreatedBy()).thenReturn(5L);

            when(courseRepository.findById(10L))
                    .thenReturn(Optional.of(course));

            when(user.getId()).thenReturn(5L);

            when(user.getAuthorities()).thenAnswer(
                    invocation -> List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_LECTURER"
                            )
                    )
            );

            assertDoesNotThrow(
                    () -> service.requireManagePermission(
                            10L, user
                    )
            );
        }

        @Test
        void shouldRejectOtherLecturer() {
            Course course = mock(Course.class);

            when(course.getCreatedBy()).thenReturn(5L);

            when(courseRepository.findById(10L))
                    .thenReturn(Optional.of(course));

            when(user.getId()).thenReturn(9L);

            when(user.getAuthorities()).thenAnswer(
                    invocation -> List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_LECTURER"
                            )
                    )
            );

            assertHttpStatus(
                    HttpStatus.FORBIDDEN,
                    () -> service.requireManagePermission(
                            10L, user
                    )
            );
        }

        @Test
        void shouldRejectStudent() {
            Course course = mock(Course.class);

            when(courseRepository.findById(10L))
                    .thenReturn(Optional.of(course));

            when(user.getAuthorities()).thenAnswer(
                    invocation -> List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_STUDENT"
                            )
                    )
            );

            assertHttpStatus(
                    HttpStatus.FORBIDDEN,
                    () -> service.requireManagePermission(
                            10L, user
                    )
            );
        }

        @Test
        void shouldRejectMissingCourse() {
            when(courseRepository.findById(99L))
                    .thenReturn(Optional.empty());

            assertHttpStatus(
                    HttpStatus.NOT_FOUND,
                    () -> service.requireManagePermission(
                            99L, user
                    )
            );
        }
    }
}

