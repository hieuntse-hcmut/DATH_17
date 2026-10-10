package com.smartcampus.backend.course;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.backend.course.dto.CreateCourseRequest;
import com.smartcampus.backend.course.dto.UpdateCourseRequest;
import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.entity.PublicationState;
import com.smartcampus.backend.course.exception.CourseNotFoundException;
import com.smartcampus.backend.course.repository.CourseRepository;
import com.smartcampus.backend.course.service.CourseService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {
    @Mock CourseRepository repository;
    @InjectMocks CourseService service;

    @Test
    void listsCoursesInIdOrder() {
        Course course = course(1L);
        when(repository.findAll(Sort.by("id"))).thenReturn(List.of(course));

        assertThat(service.findAll()).extracting(response -> response.id()).containsExactly(1L);
    }

    @Test
    void readsCourseAndReportsMissingCourse() {
        when(repository.findById(1L)).thenReturn(Optional.of(course(1L)));
        when(repository.findById(2L)).thenReturn(Optional.empty());

        assertThat(service.findById(1L).title()).isEqualTo("Intro");
        assertThatThrownBy(() -> service.findById(2L))
                .isInstanceOf(CourseNotFoundException.class);
    }

    @Test
    void createsDraftWithClosedEnrollmentByDefault() {
        when(repository.saveAndFlush(any(Course.class))).thenAnswer(invocation -> {
            Course saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 3L);
            return saved;
        });

        var response = service.create(new CreateCourseRequest(" Intro ", null, null, null, 7L));

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.title()).isEqualTo("Intro");
        assertThat(response.publicationState()).isEqualTo(PublicationState.DRAFT);
        assertThat(response.enrollmentOpen()).isFalse();
        assertThat(response.createdBy()).isEqualTo(7L);
    }

    @Test
    void updatesCourseWithoutChangingCreator() {
        Course course = course(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(course));
        when(repository.saveAndFlush(course)).thenReturn(course);

        var response = service.update(1L,
                new UpdateCourseRequest(" Advanced ", "Details", PublicationState.PUBLISHED, true));

        assertThat(response.title()).isEqualTo("Advanced");
        assertThat(response.description()).isEqualTo("Details");
        assertThat(response.publicationState()).isEqualTo(PublicationState.PUBLISHED);
        assertThat(response.enrollmentOpen()).isTrue();
        assertThat(response.createdBy()).isEqualTo(7L);
        verify(repository).saveAndFlush(course);
    }

    private Course course(Long id) {
        Course course = new Course("Intro", null, PublicationState.DRAFT, false, 7L);
        ReflectionTestUtils.setField(course, "id", id);
        return course;
    }
}
