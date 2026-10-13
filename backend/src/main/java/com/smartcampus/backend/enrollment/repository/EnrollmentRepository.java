package com.smartcampus.backend.enrollment.repository;

import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import com.smartcampus.backend.enrollment.repository.projection.MyEnrollmentView;
import com.smartcampus.backend.enrollment.repository.projection.UserAccountInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query(value = """
            SELECT c.id                AS id,
                   c.title             AS title,
                   c.publication_state AS publicationState,
                   CASE WHEN c.is_enrollment_open THEN 'OPEN' ELSE 'CLOSED' END AS enrollmentWindow
            FROM courses c
            WHERE c.id = :courseId
            """, nativeQuery = true)
    Optional<CourseEnrollmentInfo> findCourseEnrollmentInfo(@Param("courseId") Long courseId);

    @Query(value = """
            SELECT u.id     AS id,
                   u.role   AS role,
                   u.status AS status
            FROM users u
            WHERE u.id = :userId
            """, nativeQuery = true)
    Optional<UserAccountInfo> findUserAccountInfo(@Param("userId") Long userId);

    @Query(value = """
            SELECT u.id
            FROM users u
            WHERE u.username = :login OR u.email = :login
            """, nativeQuery = true)
    Optional<Long> findUserIdByLogin(@Param("login") String login);

    @Query(value = """
            SELECT e.id                AS enrollmentId,
                   e.status            AS status,
                   e.enrolled_at       AS enrolledAt,
                   c.id                AS courseId,
                   c.title             AS courseTitle,
                   c.description       AS courseDescription,
                   c.publication_state AS publicationState
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = :studentId
              AND e.status = 'ACTIVE'
            ORDER BY e.enrolled_at DESC, e.id DESC
            """, nativeQuery = true)
    List<MyEnrollmentView> findActiveEnrollmentsOfStudent(@Param("studentId") Long studentId);
}