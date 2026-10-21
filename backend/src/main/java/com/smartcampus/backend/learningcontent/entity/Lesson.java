package com.smartcampus.backend.learningcontent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    protected Lesson() {}

    public Lesson(Long chapterId, String title,
                  String contentType, int orderIndex) {
        this.chapterId = chapterId;
        this.title = title;
        this.contentType = contentType;
        this.orderIndex = orderIndex;
    }

    public Long getId() {
        return id;
    }

    public Long getChapterId() {
        return chapterId;
    }

    public String getTitle() {
        return title;
    }

    public String getContentType() {
        return contentType;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void update(String title, String contentType,
                       int orderIndex) {
        this.title = title;
        this.contentType = contentType;
        this.orderIndex = orderIndex;
    }
}
