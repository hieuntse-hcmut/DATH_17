package com.smartcampus.backend.learningcontent.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.entity.PublicationState;
import com.smartcampus.backend.course.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Authorization for Learning Content (BR-CONTENT-002, BR-CONTENT-005, BR-ENROLL-003).
 *
 *  manage (create/update/delete): admin, the course creator, or a lecturer assigned in course_lecturers
 *  view   (read chapters/lessons/materials): everyone who can manage, plus a student with an
 *          ACTIVE enrollment in a PUBLISHED course
 */
@Service
public class CourseAccessService {

    private final CourseRepository courseRepository;
    private final JdbcTemplate jdbcTemplate;

    public CourseAccessService(CourseRepository courseRepository, JdbcTemplate jdbcTemplate) {
        this.courseRepository = courseRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    /** 404 if the course does not exist, 403 if the user may not manage its content. */
    public void requireManagePermission(Long courseId, CustomUserDetails currentUser) {
        Course course = requireCourse(courseId);
        if (!canManage(course, courseId, currentUser)) {
            throw forbidden("You cannot manage this course");
        }
    }

    /** 404 if the course does not exist, 403 if the user may not read its content. */
    public void requireViewPermission(Long courseId, CustomUserDetails currentUser) {
        Course course = requireCourse(courseId);
        if (canManage(course, courseId, currentUser)) {
            return;
        }
        if (hasRole(currentUser, "STUDENT")
                && course.getPublicationState() == PublicationState.PUBLISHED
                && hasActiveEnrollment(courseId, currentUser.getId())) {
            return;
        }
        throw forbidden("You cannot view the content of this course");
    }

    private boolean canManage(Course course, Long courseId, CustomUserDetails user) {
        if (hasRole(user, "ADMIN")) {
            return true;
        }
        if (!hasRole(user, "LECTURER")) {
            return false;
        }
        return course.getCreatedBy().equals(user.getId())
                || isAssignedLecturer(courseId, user.getId());
    }

    private boolean isAssignedLecturer(Long courseId, Long lecturerId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM course_lecturers WHERE course_id = ? AND lecturer_id = ?",
                Integer.class, courseId, lecturerId);
        return count != null && count > 0;
    }

    private boolean hasActiveEnrollment(Long courseId, Long studentId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments WHERE course_id = ? AND student_id = ? AND status = 'ACTIVE'",
                Integer.class, courseId, studentId);
        return count != null && count > 0;
    }

    private Course requireCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    private static boolean hasRole(CustomUserDetails user, String role) {
        return user.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    private static ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
