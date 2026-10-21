
package com.smartcampus.backend.learningcontent.repository;

import com.smartcampus.backend.learningcontent.entity.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningMaterialRepository
        extends JpaRepository<LearningMaterial, Long> {

    List<LearningMaterial> findByLessonIdOrderByIdAsc(
            Long lessonId
    );
}
