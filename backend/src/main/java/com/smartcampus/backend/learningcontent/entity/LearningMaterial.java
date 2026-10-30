
package com.smartcampus.backend.learningcontent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_materials")
public class LearningMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(nullable = false)
    private String title;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType;

    protected LearningMaterial() {}

    public LearningMaterial(
            Long lessonId,
            String title,
            String fileUrl,
            String fileType
    ) {
        this.lessonId = lessonId;
        this.title = title;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
    }

    public Long getId() {
        return id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getTitle() {
        return title;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void update(
            String title,
            String fileUrl,
            String fileType
    ) {
        this.title = title;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
    }
}
