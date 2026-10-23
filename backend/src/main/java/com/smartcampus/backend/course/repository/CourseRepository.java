package com.smartcampus.backend.course.repository;

import com.smartcampus.backend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Collection<Course> findByCreatedBy(Long id);
}
