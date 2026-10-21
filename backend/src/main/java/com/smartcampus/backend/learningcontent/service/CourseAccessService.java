
package com.smartcampus.backend.learningcontent.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CourseAccessService {

    private final CourseRepository courseRepository;

    public CourseAccessService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public void requireManagePermission(
            Long courseId,
            CustomUserDetails currentUser
    ) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found"
                ));

        boolean isAdmin = currentUser.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                );

        boolean isLecturer = currentUser.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_LECTURER")
                );

        if (isAdmin) {
            return;
        }

        if (isLecturer
                && course.getCreatedBy().equals(currentUser.getId())) {
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You cannot manage this course"
        );
    }
}
