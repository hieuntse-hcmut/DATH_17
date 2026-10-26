package com.smartcampus.backend.analytics.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.smartcampus.backend.analytics.dto.CourseRiskSummaryResponse;
import com.smartcampus.backend.analytics.dto.StudentRiskResponse;

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

    public Optional<CourseRiskSummaryResponse> findRiskSummary(Long courseId) {
        List<CourseRiskSummaryResponse> rows = jdbcTemplate.query("""
            SELECT 
                course_id,
                AVG(risk_score) AS avg_score,
                COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) AS high_count,
                COUNT(CASE WHEN risk_level = 'MEDIUM' THEN 1 END) AS medium_count,
                COUNT(CASE WHEN risk_level = 'LOW' THEN 1 END) AS low_count
            FROM risk_assessments
            WHERE course_id = ?
            GROUP BY course_id
            """,
                (rs, i) -> new CourseRiskSummaryResponse(
                        rs.getLong("course_id"),
                        rs.getDouble("avg_score") != 0 ? Math.round(rs.getDouble("avg_score") * 10.0) / 10.0 : 0.0,
                        rs.getInt("high_count"),
                        rs.getInt("medium_count"),
                        rs.getInt("low_count")
                ),
                courseId);
        return rows.stream().findFirst();
    }

    public List<StudentRiskResponse> findStudentRisksByCourse(Long courseId) {
        return jdbcTemplate.query("""
            SELECT 
                u.id AS student_id,
                u.username,
                u.full_name,
                u.email,
                ra.risk_score,
                ra.risk_level,
                ra.assessed_at
            FROM enrollments e
            JOIN users u ON u.id = e.student_id
            LEFT JOIN risk_assessments ra ON ra.student_id = u.id AND ra.course_id = e.course_id
            WHERE e.course_id = ? AND e.status = 'ACTIVE'
            ORDER BY ra.risk_score DESC, u.full_name ASC
            """,
                (rs, i) -> new StudentRiskResponse(
                        rs.getLong("student_id"),
                        rs.getString("username"),
                        rs.getString("full_name"),
                        rs.getString("email"),
                        rs.getObject("risk_score") != null ? rs.getDouble("risk_score") : 0.0,
                        rs.getString("risk_level") != null ? rs.getString("risk_level") : "LOW",
                        rs.getTimestamp("assessed_at") != null ? rs.getTimestamp("assessed_at").toLocalDateTime() : null
                ),
                courseId);
    }
}
