package com.smartcampus.backend.learningcontent.repository;

import com.smartcampus.backend.learningcontent.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    boolean existsByCourseIdAndOrderIndex(Long courseId, int orderIndex);

    boolean existsByCourseIdAndOrderIndexAndIdNot(
            Long courseId, int orderIndex, Long id);
}