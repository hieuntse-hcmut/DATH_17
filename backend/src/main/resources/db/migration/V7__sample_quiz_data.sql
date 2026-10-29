-- V7__sample_quiz_data.sql
-- Dữ liệu test giao diện làm bài (course 1: Lập trình Java Core).
-- student01 / student02 đã ACTIVE ở course 1, lecturer01 là giảng viên.

-- ============================================================
-- Ngân hàng câu hỏi (đủ 4 loại)
-- ============================================================
INSERT INTO question_bank (id, course_id, content, question_type) VALUES
(101, 1, 'Từ khóa nào dùng để khai báo hằng số trong Java?', 'SINGLE_CHOICE'),
(102, 1, 'Chọn TẤT CẢ các kiểu dữ liệu nguyên thủy (primitive) trong Java:', 'MULTIPLE_CHOICE'),
(103, 1, 'Java là ngôn ngữ biên dịch ra bytecode chạy trên JVM.', 'TRUE_FALSE'),
(104, 1, 'Đoạn code sau in ra gì?\n```java\nint x = 5;\nx += 3 * 2;\nSystem.out.println(x);\n```', 'SINGLE_CHOICE'),
(105, 1, 'Giải thích ngắn gọn sự khác nhau giữa == và equals() khi so sánh String.', 'SHORT_ANSWER');

INSERT INTO question_options (question_id, content, is_correct, order_index) VALUES
(101, 'const',  FALSE, 0), (101, 'final',  TRUE,  1), (101, 'static', FALSE, 2), (101, 'volatile', FALSE, 3),
(102, 'int',    TRUE,  0), (102, 'String', FALSE, 1), (102, 'boolean', TRUE, 2), (102, 'double', TRUE, 3), (102, 'Integer', FALSE, 4),
(103, 'Đúng',   TRUE,  0), (103, 'Sai',    FALSE, 1),
(104, '11',     TRUE,  0), (104, '16',     FALSE, 1), (104, '8',      FALSE, 2), (104, '30', FALSE, 3);

-- ============================================================
-- Các bài kiểm tra ở nhiều trạng thái
-- ============================================================
INSERT INTO assessments (id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts) VALUES
(101, 1, 'Java cơ bản - đang mở (15 phút)',      'PUBLISHED', NULL, NULL, 15,   3),
(102, 1, 'Quiz không giới hạn thời gian',        'PUBLISHED', NULL, NULL, NULL, 1),
(103, 1, 'Quiz chưa mở (mở sau 1 ngày)',         'PUBLISHED', DATE_ADD(NOW(), INTERVAL 1 DAY),  DATE_ADD(NOW(), INTERVAL 2 DAY), 10, 1),
(104, 1, 'Quiz đã đóng (đóng từ hôm qua)',       'PUBLISHED', DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 1 DAY), 10, 1),
(105, 1, 'Quiz nháp (chỉ giảng viên thấy)',      'DRAFT',     NULL, NULL, 10, 1),
(106, 1, 'Test hết giờ (1 phút)',                'PUBLISHED', NULL, NULL, 1,    5);

INSERT INTO assessment_questions (assessment_id, question_id, order_index, points) VALUES
(101, 101, 0, 2.00), (101, 102, 1, 3.00), (101, 103, 2, 1.00), (101, 104, 3, 2.00), (101, 105, 4, 2.00),
(102, 101, 0, 5.00), (102, 103, 1, 5.00),
(103, 101, 0, 10.00),
(104, 101, 0, 10.00),
(105, 101, 0, 10.00),
(106, 101, 0, 5.00), (106, 104, 1, 5.00);