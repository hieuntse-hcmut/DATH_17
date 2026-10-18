package com.smartcampus.backend.common.security;

import com.smartcampus.backend.common.exception.ApiException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Shared authorization checks (BR-ENROLL-004, BR-ANL-006):
 *   - an Administrator manages every course
 *   - a Lecturer manages a course he created (courses.created_by)
 *     or is assigned to (course_lecturers)
 *   - a Student never manages a course
 *
 * Uses JdbcTemplate on the V1 tables so it does not depend on other modules' entities.
 */
@Component
public class CourseAccessGuard {

    private final JdbcTemplate jdbcTemplate;

    public CourseAccessGuard(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<UserAccount> findUser(Long userId) {
        List<UserAccount> rows = jdbcTemplate.query(
                "SELECT id, role, status, full_name FROM users WHERE id = ?",
                (rs, i) -> new UserAccount(rs.getLong("id"), rs.getString("role"),
                        rs.getString("status"), rs.getString("full_name")),
                userId);
        return rows.stream().findFirst();
    }

    /** The logged-in user; 401 if the account no longer exists. */
    public UserAccount requireUser(Long userId) {
        return findUser(userId).orElseThrow(() -> ApiException.unauthorized("User " + userId + " does not exist"));
    }

    public boolean courseExists(Long courseId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM courses WHERE id = ?", Integer.class, courseId);
        return count != null && count > 0;
    }

    public boolean canManageCourse(UserAccount user, Long courseId) {
        if (user.isAdmin()) {
            return true;
        }
        if (!user.isLecturer()) {
            return false;
        }
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM courses c
                WHERE c.id = ?
                  AND (c.created_by = ?
                       OR EXISTS (SELECT 1 FROM course_lecturers cl
                                  WHERE cl.course_id = c.id AND cl.lecturer_id = ?))
                """, Integer.class, courseId, user.id(), user.id());
        return count != null && count > 0;
    }

    /** 404 if the course does not exist, 403 if the user may not manage it. */
    public void requireCourseManager(UserAccount user, Long courseId) {
        if (!courseExists(courseId)) {
            throw ApiException.notFound("COURSE_NOT_FOUND", "Course " + courseId + " does not exist");
        }
        if (!canManageCourse(user, courseId)) {
            throw ApiException.forbidden("NOT_COURSE_STAFF",
                    "Only an assigned lecturer or an administrator can manage course " + courseId);
        }
    }

    /** Ids of the courses this user manages: all courses for an admin, own/assigned for a lecturer. */
    public List<Long> managedCourseIds(UserAccount user) {
        if (user.isAdmin()) {
            return jdbcTemplate.queryForList("SELECT id FROM courses ORDER BY id", Long.class);
        }
        if (!user.isLecturer()) {
            return List.of();
        }
        return jdbcTemplate.queryForList("""
                SELECT c.id FROM courses c
                WHERE c.created_by = ?
                   OR EXISTS (SELECT 1 FROM course_lecturers cl
                              WHERE cl.course_id = c.id AND cl.lecturer_id = ?)
                ORDER BY c.id
                """, Long.class, user.id(), user.id());
    }
}
