package com.smartcampus.backend.progress.repository;

import com.smartcampus.backend.progress.entity.LearningMaterialProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface LearningMaterialProgressRepository extends JpaRepository<LearningMaterialProgress, Long> {
    Optional<LearningMaterialProgress> findByStudentIdAndMaterialId(Long studentId, Long materialId);

    @Modifying
    @Query(value = """
        INSERT INTO learning_material_progress(student_id, material_id, is_completed, last_position)
        VALUES (:studentId, :materialId, :completed, :position)
        ON DUPLICATE KEY UPDATE
          is_completed = is_completed OR VALUES(is_completed),
          last_position = GREATEST(last_position, VALUES(last_position))
        """, nativeQuery = true)
    void upsert(@Param("studentId") Long studentId,
                @Param("materialId") Long materialId,
                @Param("position") int position,
                @Param("completed") boolean completed);

    @Query(value = """
        SELECT COUNT(*) FROM learning_materials m
        LEFT JOIN learning_material_progress p ON p.material_id = m.id AND p.student_id = :studentId
        WHERE m.lesson_id = :lessonId AND (p.id IS NULL OR p.is_completed = FALSE)
        """, nativeQuery = true)
    long countIncompleteMaterials(@Param("studentId") Long studentId,
                                  @Param("lessonId") Long lessonId);

    @Query(value = "SELECT COUNT(*) FROM learning_materials WHERE lesson_id = :lessonId", nativeQuery = true)
    long countMaterials(@Param("lessonId") Long lessonId);
}
