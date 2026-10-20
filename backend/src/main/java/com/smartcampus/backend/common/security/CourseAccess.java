package com.smartcampus.backend.common.security;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CourseAccess {
    private final JdbcTemplate jdbc;

    public CourseAccess(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Long userId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user.getId();
    }

    public boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    public void requireStaff(Long courseId) {
        requireCourse(courseId);
        if (hasRole("ADMIN")) return;
        if (!hasRole("LECTURER")) forbidden();
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM courses c LEFT JOIN course_lecturers cl ON cl.course_id = c.id
                WHERE c.id = ? AND (c.created_by = ? OR cl.lecturer_id = ?)
                """, Integer.class, courseId, userId(), userId());
        if (count == null || count == 0) forbidden();
    }

    public void requireParticipant(Long courseId) {
        requireCourse(courseId);
        if (hasRole("ADMIN") || hasRole("LECTURER") && isStaff(courseId)) return;
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM enrollments WHERE course_id = ? AND student_id = ? AND status = 'ACTIVE'
                """, Integer.class, courseId, userId());
        if (!hasRole("STUDENT") || count == null || count == 0) forbidden();
    }

    private boolean isStaff(Long courseId) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM courses c LEFT JOIN course_lecturers cl ON cl.course_id = c.id
                WHERE c.id = ? AND (c.created_by = ? OR cl.lecturer_id = ?)
                """, Integer.class, courseId, userId(), userId());
        return count != null && count > 0;
    }

    public void requireCourse(Long courseId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM courses WHERE id = ?", Integer.class, courseId);
        if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
    }

    public static void forbidden() { throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Course access denied"); }
}
