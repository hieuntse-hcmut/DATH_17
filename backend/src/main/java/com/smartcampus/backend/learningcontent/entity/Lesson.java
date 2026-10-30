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

    /** V5: giây (VIDEO) hoặc số trang (PDF); null với TEXT hoặc khi lecturer chưa nhập. */
    @Column(name = "total_length")
    private Integer totalLength;

    protected Lesson() {}

    public Lesson(Long chapterId, String title,
                  String contentType, int orderIndex) {
        this(chapterId, title, contentType, orderIndex, null);
    }

    public Lesson(Long chapterId, String title,
                  String contentType, int orderIndex, Integer totalLength) {
        this.chapterId = chapterId;
        this.title = title;
        this.contentType = contentType;
        this.orderIndex = orderIndex;
        this.totalLength = totalLength;
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

    public int getOrderIndex() {
        return orderIndex;
    }

    public Integer getTotalLength() {
        return totalLength;
    }

    public void update(String title, String contentType,
                       int orderIndex, Integer totalLength) {
        this.title = title;
        this.contentType = contentType;
        this.orderIndex = orderIndex;
        this.totalLength = totalLength;
    }
}
