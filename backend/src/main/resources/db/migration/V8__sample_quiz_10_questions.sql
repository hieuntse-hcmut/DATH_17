-- V8__sample_quiz_10_questions.sql
-- Bài kiểm tra 10 câu (course 1) để test giao diện làm bài, chấm điểm và lịch sử.

INSERT INTO question_bank (id, course_id, content, question_type) VALUES
(201, 1, 'Kết quả của biểu thức 10 / 4 với kiểu int trong Java là gì?', 'SINGLE_CHOICE'),
(202, 1, 'Đoạn code sau in ra gì?\n```java\nString a = "hi";\nString b = new String("hi");\nSystem.out.println(a == b);\n```', 'SINGLE_CHOICE'),
(203, 1, 'Chọn TẤT CẢ các lớp triển khai interface List trong Java:', 'MULTIPLE_CHOICE'),
(204, 1, 'Một lớp trong Java có thể kế thừa (extends) nhiều lớp cùng lúc.', 'TRUE_FALSE'),
(205, 1, 'Từ khóa nào ngăn một lớp bị kế thừa?', 'SINGLE_CHOICE'),
(206, 1, 'Những phát biểu nào đúng về interface từ Java 8 trở lên?', 'MULTIPLE_CHOICE'),
(207, 1, 'Đoạn code sau in ra gì?\n```java\nint[] arr = {1, 2, 3};\nint sum = 0;\nfor (int n : arr) sum += n * 2;\nSystem.out.println(sum);\n```', 'SINGLE_CHOICE'),
(208, 1, 'Phương thức main phải có kiểu trả về void để chương trình Java chạy được.', 'TRUE_FALSE'),
(209, 1, 'Ngoại lệ nào được ném ra khi truy cập phần tử ngoài chỉ số của mảng?', 'SINGLE_CHOICE'),
(210, 1, 'Nêu sự khác nhau chính giữa ArrayList và LinkedList.', 'SHORT_ANSWER');

INSERT INTO question_options (question_id, content, is_correct, order_index) VALUES
(201, '2',   TRUE,  0), (201, '2.5', FALSE, 1), (201, '3',   FALSE, 2), (201, '2.0', FALSE, 3),
(202, 'true', FALSE, 0), (202, 'false', TRUE, 1), (202, 'hi', FALSE, 2), (202, 'Lỗi biên dịch', FALSE, 3),
(203, 'ArrayList', TRUE, 0), (203, 'LinkedList', TRUE, 1), (203, 'HashMap', FALSE, 2),
(203, 'Vector', TRUE, 3), (203, 'HashSet', FALSE, 4),
(204, 'Đúng', FALSE, 0), (204, 'Sai', TRUE, 1),
(205, 'final', TRUE, 0), (205, 'static', FALSE, 1), (205, 'abstract', FALSE, 2), (205, 'private', FALSE, 3),
(206, 'Có thể có phương thức default', TRUE, 0),
(206, 'Có thể có phương thức static', TRUE, 1),
(206, 'Có thể khai báo constructor', FALSE, 2),
(206, 'Một lớp có thể implements nhiều interface', TRUE, 3),
(207, '6', FALSE, 0), (207, '12', TRUE, 1), (207, '3', FALSE, 2), (207, '18', FALSE, 3),
(208, 'Đúng', TRUE, 0), (208, 'Sai', FALSE, 1),
(209, 'ArrayIndexOutOfBoundsException', TRUE, 0), (209, 'NullPointerException', FALSE, 1),
(209, 'ClassCastException', FALSE, 2), (209, 'NumberFormatException', FALSE, 3);

INSERT INTO assessments (id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts) VALUES
(201, 1, 'Java nâng cao - 10 câu (2 lượt)', 'PUBLISHED', NULL, NULL, 20, 2),
(202, 1, 'Test hết lượt (1 lượt, 5 phút)',  'PUBLISHED', NULL, NULL, 5,  1);

INSERT INTO assessment_questions (assessment_id, question_id, order_index, points) VALUES
(201, 201, 0, 1.00), (201, 202, 1, 1.00), (201, 203, 2, 1.00), (201, 204, 3, 1.00), (201, 205, 4, 1.00),
(201, 206, 5, 1.00), (201, 207, 6, 1.00), (201, 208, 7, 1.00), (201, 209, 8, 1.00), (201, 210, 9, 1.00),
(202, 201, 0, 1.00), (202, 204, 1, 1.00), (202, 205, 2, 1.00);