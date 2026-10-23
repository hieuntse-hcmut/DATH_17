package com.smartcampus.backend.course.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.course.dto.CourseResponse;
import com.smartcampus.backend.course.dto.CreateCourseRequest;
import com.smartcampus.backend.course.dto.UpdateCourseRequest;
import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.entity.PublicationState;
import com.smartcampus.backend.course.exception.CourseNotFoundException;
import com.smartcampus.backend.course.repository.CourseRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {
    private final CourseRepository repository;

    public CourseService(CourseRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(CourseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(Long id) {
        return CourseResponse.from(requireCourse(id));
    }

    @Transactional
    public CourseResponse create(CreateCourseRequest request) {
        Course course = new Course(request.title().trim(), request.description(),
                request.publicationState() == null ? PublicationState.DRAFT : request.publicationState(),
                Boolean.TRUE.equals(request.enrollmentOpen()), request.createdBy());
        return CourseResponse.from(repository.saveAndFlush(course));
    }

    @Transactional
    public CourseResponse update(Long id, UpdateCourseRequest request) {
        Course course = requireCourse(id);
        course.update(request.title().trim(), request.description(), request.publicationState(),
                request.enrollmentOpen());
        return CourseResponse.from(repository.saveAndFlush(course));
    }

    private Course requireCourse(Long id) {
        return repository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses(
            CustomUserDetails currentUser) {

        return repository
                .findByCreatedBy(currentUser.getId())
                .stream()
                .map(CourseResponse::from)
                .toList();
    }
}
