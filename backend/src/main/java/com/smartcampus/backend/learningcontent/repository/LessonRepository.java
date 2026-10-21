package com.smartcampus.backend.learningcontent.repository;

import com.smartcampus.backend.learningcontent.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByChapterIdOrderByOrderIndexAsc(Long chapterId);

    boolean existsByChapterIdAndOrderIndex(Long chapterId, int orderIndex);

    boolean existsByChapterIdAndOrderIndexAndIdNot(
            Long chapterId, int orderIndex, Long id);
}