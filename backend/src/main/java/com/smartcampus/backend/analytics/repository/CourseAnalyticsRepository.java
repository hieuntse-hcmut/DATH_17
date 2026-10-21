package com.smartcampus.backend.analytics.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Aggregate queries for course-level analytics (FR-ANL-009). Read-only. */
@Repository
public class CourseAnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public CourseAnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<CourseEnrollmentStats> findEnrollmentStats(Long courseId) {
        List<CourseEnrollmentStats> rows = jdbcTemplate.query("""
                SELECT c.id                 AS course_id,
                       c.title              AS course_title,
                       c.publication_state  AS publication_state,
                       c.is_enrollment_open AS enrollment_open,
                       COUNT(CASE WHEN e.status = 'ACTIVE'    THEN 1 END) AS active_count,
                       COUNT(CASE WHEN e.status = 'WITHDRAWN' THEN 1 END) AS withdrawn_count,
                       COUNT(CASE WHEN e.status = 'REMOVED'   THEN 1 END) AS removed_count,
                       COUNT(e.id)                                        AS total_count,
                       COUNT(CASE WHEN e.enrolled_at >= CURRENT_TIMESTAMP - INTERVAL 7 DAY THEN 1 END) AS new_7d_count
                FROM courses c
                LEFT JOIN enrollments e ON e.course_id = c.id
                WHERE c.id = ?
                GROUP BY c.id, c.title, c.publication_state, c.is_enrollment_open
                """,
                (rs, i) -> new CourseEnrollmentStats(
                        rs.getLong("course_id"),
                        rs.getString("course_title"),
                        rs.getString("publication_state"),
                        rs.getBoolean("enrollment_open"),
                        rs.getLong("active_count"),
                        rs.getLong("withdrawn_count"),
                        rs.getLong("removed_count"),
                        rs.getLong("total_count"),
                        rs.getLong("new_7d_count")),
                courseId);
        return rows.stream().findFirst();
    }
}
