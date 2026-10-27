package com.smartcampus.backend.progress.repository;

import com.smartcampus.backend.progress.entity.LearningProgress;
import com.smartcampus.backend.progress.repository.projection.LessonContextView;
import com.smartcampus.backend.progress.repository.projection.LessonProgressView;
import com.smartcampus.backend.progress.repository.projection.MyCourseProgressView;
import com.smartcampus.backend.progress.repository.projection.StudentProgressView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Reads lessons/chapters/courses/enrollments with native queries on the V1 schema, so this module
 * does not depend on the Learning Content entities (Chapter/Lesson) that are developed in parallel.
 * Every lesson counts as required (V1 has no "optional lesson" column yet, BR-PROG-002).
 */
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {

    Optional<LearningProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);

    /** Manual "Mark as done": insert or set is_completed, keep last_position. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            INSERT INTO learning_progress (student_id, lesson_id, is_completed, last_position)
            VALUES (:studentId, :lessonId, TRUE, 0)
            ON DUPLICATE KEY UPDATE
                is_completed = TRUE,
                updated_at   = CURRENT_TIMESTAMP
            """, nativeQuery = true)
    int upsertCompleted(@Param("studentId") Long studentId, @Param("lessonId") Long lessonId);

    /** Save the resume position; completion is sticky (never goes back to false). */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            INSERT INTO learning_progress (student_id, lesson_id, is_completed, last_position)
            VALUES (:studentId, :lessonId, :completed, :position) AS incoming
            ON DUPLICATE KEY UPDATE
                is_completed  = (learning_progress.is_completed OR incoming.is_completed),
                last_position = incoming.last_position,
                updated_at    = CURRENT_TIMESTAMP
            """, nativeQuery = true)
    int upsertPosition(@Param("studentId") Long studentId,
                       @Param("lessonId") Long lessonId,
                       @Param("position") int position,
                       @Param("completed") boolean completed);

    @Query(value = """
            SELECT l.id                AS lessonId,
                   l.title             AS lessonTitle,
                   l.content_type      AS contentType,
                   c.id                AS courseId,
                   c.title             AS courseTitle,
                   c.publication_state AS publicationState,
                   l.total_length      AS totalLength
            FROM lessons l
            JOIN chapters ch ON ch.id = l.chapter_id
            JOIN courses c   ON c.id = ch.course_id
            WHERE l.id = :lessonId
            """, nativeQuery = true)
    Optional<LessonContextView> findLessonContext(@Param("lessonId") Long lessonId);

    @Query(value = """
            SELECT COUNT(*) FROM enrollments
            WHERE student_id = :studentId AND course_id = :courseId AND status = 'ACTIVE'
            """, nativeQuery = true)
    long countActiveEnrollment(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query(value = "SELECT COUNT(*) FROM courses WHERE id = :courseId", nativeQuery = true)
    long countCourse(@Param("courseId") Long courseId);

    @Query(value = "SELECT title FROM courses WHERE id = :courseId", nativeQuery = true)
    Optional<String> findCourseTitle(@Param("courseId") Long courseId);

    @Query(value = """
            SELECT COUNT(*)
            FROM lessons l
            JOIN chapters ch ON ch.id = l.chapter_id
            WHERE ch.course_id = :courseId
            """, nativeQuery = true)
    long countLessonsOfCourse(@Param("courseId") Long courseId);

    @Query(value = """
            SELECT COUNT(*)
            FROM learning_progress lp
            JOIN lessons l   ON l.id = lp.lesson_id
            JOIN chapters ch ON ch.id = l.chapter_id
            WHERE ch.course_id = :courseId
              AND lp.student_id = :studentId
              AND lp.is_completed = TRUE
            """, nativeQuery = true)
    long countCompletedLessons(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    /** All lessons of a course in display order, with this student's progress. */
    @Query(value = """
            SELECT l.id              AS lessonId,
                   l.title           AS lessonTitle,
                   l.content_type    AS contentType,
                   ch.id             AS chapterId,
                   ch.title          AS chapterTitle,
                   CAST(COALESCE(lp.is_completed, 0) AS SIGNED) AS completed,
                   lp.last_position  AS lastPosition,
                   lp.updated_at     AS lastAccessedAt
            FROM chapters ch
            JOIN lessons l ON l.chapter_id = ch.id
            LEFT JOIN learning_progress lp ON lp.lesson_id = l.id AND lp.student_id = :studentId
            WHERE ch.course_id = :courseId
            ORDER BY ch.order_index, l.order_index, l.id
            """, nativeQuery = true)
    List<LessonProgressView> findLessonsWithProgress(@Param("studentId") Long studentId,
                                                     @Param("courseId") Long courseId);

    /** FR-PROG-003/004: every ACTIVE course of the student, most recently accessed first. */
    @Query(value = """
            SELECT c.id          AS courseId,
                   c.title       AS courseTitle,
                   u.full_name   AS instructorName,
                   e.enrolled_at AS enrolledAt,
                   (SELECT COUNT(*)
                      FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = c.id) AS totalLessons,
                   (SELECT COUNT(*)
                      FROM learning_progress lp
                      JOIN lessons l   ON l.id = lp.lesson_id
                      JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = c.id AND lp.student_id = e.student_id
                       AND lp.is_completed = TRUE) AS completedLessons,
                   (SELECT MAX(lp.updated_at)
                      FROM learning_progress lp
                      JOIN lessons l   ON l.id = lp.lesson_id
                      JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = c.id AND lp.student_id = e.student_id) AS lastAccessedAt,
                   (SELECT lp.lesson_id
                      FROM learning_progress lp
                      JOIN lessons l   ON l.id = lp.lesson_id
                      JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = c.id AND lp.student_id = e.student_id
                     ORDER BY lp.updated_at DESC, lp.id DESC LIMIT 1) AS lastLessonId,
                   (SELECT l.title
                      FROM learning_progress lp
                      JOIN lessons l   ON l.id = lp.lesson_id
                      JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = c.id AND lp.student_id = e.student_id
                     ORDER BY lp.updated_at DESC, lp.id DESC LIMIT 1) AS lastLessonTitle
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            JOIN users u   ON u.id = c.created_by
            WHERE e.student_id = :studentId
              AND e.status = 'ACTIVE'
            ORDER BY COALESCE(lastAccessedAt, e.enrolled_at) DESC, c.id
            """, nativeQuery = true)
    List<MyCourseProgressView> findMyCourseProgress(@Param("studentId") Long studentId);

    /** FR-PROG-006: every ACTIVE student of a course with completed-lesson counts. */
    @Query(value = """
            SELECT u.id        AS studentId,
                   u.username  AS username,
                   u.full_name AS fullName,
                   (SELECT COUNT(*)
                      FROM learning_progress lp
                      JOIN lessons l   ON l.id = lp.lesson_id
                      JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = e.course_id AND lp.student_id = e.student_id
                       AND lp.is_completed = TRUE) AS completedLessons,
                   (SELECT MAX(lp.updated_at)
                      FROM learning_progress lp
                      JOIN lessons l   ON l.id = lp.lesson_id
                      JOIN chapters ch ON ch.id = l.chapter_id
                     WHERE ch.course_id = e.course_id AND lp.student_id = e.student_id) AS lastAccessedAt
            FROM enrollments e
            JOIN users u ON u.id = e.student_id
            WHERE e.course_id = :courseId
              AND e.status = 'ACTIVE'
            ORDER BY u.full_name, u.id
            """, nativeQuery = true)
    List<StudentProgressView> findClassProgress(@Param("courseId") Long courseId);
}

