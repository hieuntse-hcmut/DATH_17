package com.smartcampus.backend.course.repository;

import com.smartcampus.backend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByCreatedBy(Long lecturerId);
}
