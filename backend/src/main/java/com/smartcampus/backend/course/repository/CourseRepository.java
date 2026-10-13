package com.smartcampus.backend.course.repository;

import com.smartcampus.backend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
