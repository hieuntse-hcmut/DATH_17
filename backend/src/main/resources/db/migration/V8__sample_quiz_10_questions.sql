-- V8__sample_quiz_10_questions.sql
-- Bài kiểm tra 10 câu (course 1) để test giao diện làm bài, chấm điểm và lịch sử.

INSERT INTO question_bank (id, course_id, content, question_type) VALUES
(201, 1, 'Kết quả của biểu thức 10 / 4 với kiểu int trong Java là gì?', 'SINGLE_CHOICE'),
(202, 1, 'Đoạn code sau in ra gì?\n```java\nString a = "hi";\nString b = new String("hi");\nSystem.out.println(a == b);\n```', 'SINGLE_CHOICE'),
(203, 1, 'Lớp nào sau đây KHÔNG triển khai interface List trong Java?', 'SINGLE_CHOICE'),
(204, 1, 'Một lớp trong Java có thể kế thừa (extends) tối đa bao nhiêu lớp?', 'SINGLE_CHOICE'),
(205, 1, 'Từ khóa nào ngăn một lớp bị kế thừa?', 'SINGLE_CHOICE'),
(206, 1, 'Từ Java 8, interface có thể chứa loại phương thức nào có phần thân (body)?', 'SINGLE_CHOICE'),
(207, 1, 'Đoạn code sau in ra gì?\n```java\nint[] arr = {1, 2, 3};\nint sum = 0;\nfor (int n : arr) sum += n * 2;\nSystem.out.println(sum);\n```', 'SINGLE_CHOICE'),
(208, 1, 'Phương thức main của chương trình Java có kiểu trả về nào?', 'SINGLE_CHOICE'),
(209, 1, 'Ngoại lệ nào được ném ra khi truy cập phần tử ngoài chỉ số của mảng?', 'SINGLE_CHOICE'),
(210, 1, 'Thao tác nào của ArrayList nhanh hơn LinkedList?', 'SINGLE_CHOICE');

INSERT INTO question_options (question_id, content, is_correct, order_index) VALUES
(201, '2',   TRUE,  0), (201, '2.5', FALSE, 1), (201, '3',   FALSE, 2), (201, '2.0', FALSE, 3),
(202, 'true', FALSE, 0), (202, 'false', TRUE, 1), (202, 'hi', FALSE, 2), (202, 'Lỗi biên dịch', FALSE, 3),
(203, 'ArrayList', FALSE, 0), (203, 'LinkedList', FALSE, 1), (203, 'Vector', FALSE, 2), (203, 'HashSet', TRUE, 3),
(204, '1', TRUE, 0), (204, '2', FALSE, 1), (204, '3', FALSE, 2), (204, 'Không giới hạn', FALSE, 3),
(205, 'final', TRUE, 0), (205, 'static', FALSE, 1), (205, 'abstract', FALSE, 2), (205, 'private', FALSE, 3),
(206, 'default và static', TRUE, 0), (206, 'constructor', FALSE, 1), (206, 'final', FALSE, 2), (206, 'protected', FALSE, 3),
(207, '6', FALSE, 0), (207, '12', TRUE, 1), (207, '3', FALSE, 2), (207, '18', FALSE, 3),
(208, 'void', TRUE, 0), (208, 'int', FALSE, 1), (208, 'String', FALSE, 2), (208, 'boolean', FALSE, 3),
(209, 'ArrayIndexOutOfBoundsException', TRUE, 0), (209, 'NullPointerException', FALSE, 1),
(209, 'ClassCastException', FALSE, 2), (209, 'NumberFormatException', FALSE, 3),
(210, 'Truy cập phần tử theo chỉ số', TRUE, 0), (210, 'Chèn vào đầu danh sách', FALSE, 1),
(210, 'Xóa phần tử ở giữa bằng iterator', FALSE, 2), (210, 'Chèn vào giữa danh sách', FALSE, 3);

INSERT INTO assessments (id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts) VALUES
(201, 1, 'Java nâng cao - 10 câu (2 lượt)', 'PUBLISHED', NULL, NULL, 20, 2),
(202, 1, 'Test hết lượt (1 lượt, 5 phút)',  'PUBLISHED', NULL, NULL, 5,  1);

INSERT INTO assessment_questions (assessment_id, question_id, order_index, points) VALUES
(201, 201, 0, 1.00), (201, 202, 1, 1.00), (201, 203, 2, 1.00), (201, 204, 3, 1.00), (201, 205, 4, 1.00),
(201, 206, 5, 1.00), (201, 207, 6, 1.00), (201, 208, 7, 1.00), (201, 209, 8, 1.00), (201, 210, 9, 1.00),
(202, 201, 0, 1.00), (202, 204, 1, 1.00), (202, 205, 2, 1.00);