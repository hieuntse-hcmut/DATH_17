CREATE TABLE question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL,
    CONSTRAINT uk_question_options_order UNIQUE (question_id, order_index),
    CONSTRAINT chk_question_options_order CHECK (order_index >= 0),
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES question_bank(id)
        ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE course_discussions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_discussions_course FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_course_discussions_author FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_course_discussions_parent FOREIGN KEY (parent_id) REFERENCES course_discussions(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_course_discussions_course_created (course_id, created_at, id),
    INDEX idx_course_discussions_parent (parent_id)
);
