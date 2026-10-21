package com.smartcampus.backend.learningcontent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chapters")
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    protected Chapter() {}

    public Chapter(Long courseId, String title, int orderIndex) {
        this.courseId = courseId;
        this.title = title;
        this.orderIndex = orderIndex;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void update(String title, int orderIndex) {
        this.title = title;
        this.orderIndex = orderIndex;
    }
}
