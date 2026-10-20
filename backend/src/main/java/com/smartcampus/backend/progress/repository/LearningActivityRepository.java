package com.smartcampus.backend.progress.repository;

import com.smartcampus.backend.progress.entity.LearningActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearningActivityRepository extends JpaRepository<LearningActivity, Long> {

    /** BR-PROG-004 throttling: events of this type for this lesson in the last 15 seconds. */
    @Query(value = """
            SELECT COUNT(*)
            FROM learning_activities
            WHERE student_id = :studentId
              AND lesson_id  = :lessonId
              AND event_type = :eventType
              AND created_at >= CURRENT_TIMESTAMP - INTERVAL 15 SECOND
            """, nativeQuery = true)
    long countRecentEvents(@Param("studentId") Long studentId,
                           @Param("lessonId") Long lessonId,
                           @Param("eventType") String eventType);
}
