package com.smartcampus.backend.course.repository;

import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.entity.PublicationState;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByCreatedBy(Long lecturerId);

    /** Course catalog for students: only courses in the given publication state. */
    List<Course> findByPublicationState(PublicationState publicationState, Sort sort);
}
