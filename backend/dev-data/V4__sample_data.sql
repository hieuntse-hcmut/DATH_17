-- V4__sample_data.sql
-- Smart Campus LMS - Sample data (DEV / DEMO only)
--
-- Tài khoản mẫu (mật khẩu tất cả: 12345678, BCrypt strength 10):
--   student   / role STUDENT   (id 3)
--   admin     / role ADMIN     (id 1)
--   lecturer  / role LECTURER  (id 2)
-- Các user còn lại (id 4-8) được thêm để mỗi bảng đủ >= 5 dòng.
--
-- Chạy sau V1..V3 trên DB trống. KHÔNG nên chạy trên môi trường production.

-- ============================================================
-- 1. users
-- ============================================================
INSERT INTO users (id, username, password_hash, full_name, email, role, status) VALUES
(1, 'admin',      '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Quản Trị Viên',     'admin@smartcampus.edu.vn',      'ADMIN',    'ACTIVE'),
(2, 'lecturer',   '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Nguyễn Văn Giảng',  'lecturer@smartcampus.edu.vn',   'LECTURER', 'ACTIVE'),
(3, 'student',    '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Trần Thị Sinh',     'student@smartcampus.edu.vn',    'STUDENT',  'ACTIVE'),
(4, 'lecturer02', '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Lê Minh Tuấn',      'lecturer02@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),
(5, 'student02',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Phạm Quốc Bảo',     'student02@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
(6, 'student03',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Võ Thu Hà',         'student03@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
(7, 'student04',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Đặng Hoàng Nam',    'student04@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
(8, 'student05',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Bùi Ngọc Lan',      'student05@smartcampus.edu.vn',  'STUDENT',  'INACTIVE');

-- ============================================================
-- 2. courses
-- ============================================================
INSERT INTO courses (id, title, description, publication_state, is_enrollment_open, created_by) VALUES
(1, 'Lập trình Java cơ bản',        'Nhập môn lập trình hướng đối tượng với Java.',          'PUBLISHED', TRUE,  2),
(2, 'Cơ sở dữ liệu',                'Thiết kế CSDL quan hệ và ngôn ngữ SQL.',                'PUBLISHED', TRUE,  2),
(3, 'Cấu trúc dữ liệu và giải thuật','Các cấu trúc dữ liệu cơ bản và phân tích thuật toán.', 'PUBLISHED', FALSE, 4),
(4, 'Nhập môn Machine Learning',    'Khóa học đang soạn thảo nội dung.',                     'DRAFT',     FALSE, 4),
(5, 'Mạng máy tính (cũ)',           'Khóa học đã lưu trữ từ học kỳ trước.',                  'ARCHIVED',  FALSE, 1);

-- ============================================================
-- 3. course_lecturers
-- ============================================================
INSERT INTO course_lecturers (course_id, lecturer_id) VALUES
(1, 2),
(1, 4),
(2, 2),
(3, 4),
(4, 4),
(5, 2);

-- ============================================================
-- 4. audit_logs
-- ============================================================
INSERT INTO audit_logs (id, acting_user_id, target_user_id, action, reason, created_at) VALUES
(1, 1, 2, 'CREATE_USER',     'Tạo tài khoản giảng viên mới',                  '2026-09-01 08:00:00'),
(2, 1, 3, 'CREATE_USER',     'Tạo tài khoản sinh viên mới',                   '2026-09-01 08:05:00'),
(3, 1, 4, 'CREATE_USER',     'Tạo tài khoản giảng viên thứ hai',              '2026-09-01 08:10:00'),
(4, 1, 8, 'DEACTIVATE_USER', 'Sinh viên vi phạm quy chế học vụ',              '2026-10-12 14:30:00'),
(5, 1, NULL, 'ARCHIVE_COURSE','Lưu trữ khóa Mạng máy tính (cũ)',             '2026-09-05 09:00:00');

-- ============================================================
-- 5. chapters
-- ============================================================
INSERT INTO chapters (id, course_id, title, order_index) VALUES
(1, 1, 'Chương 1: Làm quen với Java',        0),
(2, 1, 'Chương 2: Lập trình hướng đối tượng',1),
(3, 2, 'Chương 1: Mô hình quan hệ',          0),
(4, 2, 'Chương 2: Ngôn ngữ SQL',             1),
(5, 3, 'Chương 1: Stack và Queue',           0),
(6, 3, 'Chương 2: Tìm kiếm và sắp xếp',      1),
(7, 4, 'Chương 1: Tổng quan Machine Learning',0),
(8, 5, 'Chương 1: Mô hình OSI',              0);

-- ============================================================
-- 6. enrollments
-- ============================================================
INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at) VALUES
(1, 3, 1, 'ACTIVE',    '2026-09-10 09:00:00'),
(2, 3, 2, 'ACTIVE',    '2026-09-10 09:05:00'),
(3, 3, 3, 'ACTIVE',    '2026-09-10 09:10:00'),
(4, 5, 1, 'ACTIVE',    '2026-09-11 10:00:00'),
(5, 5, 2, 'ACTIVE',    '2026-09-11 10:05:00'),
(6, 6, 1, 'ACTIVE',    '2026-09-12 11:00:00'),
(7, 6, 3, 'ACTIVE',    '2026-09-12 11:05:00'),
(8, 7, 2, 'WITHDRAWN', '2026-09-12 13:00:00'),
(9, 8, 1, 'REMOVED',   '2026-09-13 08:30:00');

-- ============================================================
-- 7. enrollment_histories
-- ============================================================
INSERT INTO enrollment_histories (id, enrollment_id, previous_status, new_status, changed_by, reason, created_at) VALUES
(1,  1, NULL,     'ACTIVE',    3, 'Sinh viên tự đăng ký',                          '2026-09-10 09:00:00'),
(2,  2, NULL,     'ACTIVE',    3, 'Sinh viên tự đăng ký',                          '2026-09-10 09:05:00'),
(3,  3, NULL,     'ACTIVE',    3, 'Sinh viên tự đăng ký',                          '2026-09-10 09:10:00'),
(4,  4, NULL,     'ACTIVE',    5, 'Sinh viên tự đăng ký',                          '2026-09-11 10:00:00'),
(5,  5, NULL,     'ACTIVE',    5, 'Sinh viên tự đăng ký',                          '2026-09-11 10:05:00'),
(6,  6, NULL,     'ACTIVE',    6, 'Sinh viên tự đăng ký',                          '2026-09-12 11:00:00'),
(7,  7, NULL,     'ACTIVE',    6, 'Sinh viên tự đăng ký',                          '2026-09-12 11:05:00'),
(8,  8, NULL,     'ACTIVE',    7, 'Sinh viên tự đăng ký',                          '2026-09-12 13:00:00'),
(9,  9, NULL,     'ACTIVE',    8, 'Sinh viên tự đăng ký',                          '2026-09-13 08:30:00'),
(10, 8, 'ACTIVE', 'WITHDRAWN', 7, 'Sinh viên rút khỏi khóa học do trùng lịch',     '2026-09-25 16:00:00'),
(11, 9, 'ACTIVE', 'REMOVED',   2, 'Giảng viên loại khỏi lớp do vi phạm quy chế',   '2026-10-12 14:00:00');

-- ============================================================
-- 8. lessons
-- ============================================================
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(1,  1, 'Bài 1: Cài đặt JDK và IDE',            'VIDEO',    0),
(2,  1, 'Bài 2: Biến và kiểu dữ liệu',          'VIDEO',    1),
(3,  2, 'Bài 3: Lớp và đối tượng',              'DOCUMENT', 0),
(4,  3, 'Bài 1: Khái niệm bảng và khóa',        'VIDEO',    0),
(5,  3, 'Bài 2: Chuẩn hóa dữ liệu',             'DOCUMENT', 1),
(6,  4, 'Bài 3: Truy vấn SELECT',               'VIDEO',    0),
(7,  5, 'Bài 1: Cấu trúc Stack',                'VIDEO',    0),
(8,  5, 'Bài 2: Cấu trúc Queue',                'DOCUMENT', 1),
(9,  6, 'Bài 3: Tìm kiếm nhị phân',             'VIDEO',    0),
(10, 7, 'Bài 1: Machine Learning là gì?',       'DOCUMENT', 0);

-- ============================================================
-- 9. learning_materials
-- ============================================================
INSERT INTO learning_materials (id, lesson_id, title, file_url, file_type) VALUES
(1, 1, 'Video cài đặt JDK',               'https://cdn.smartcampus.edu.vn/materials/java/jdk-install.mp4',  'VIDEO'),
(2, 2, 'Slide biến và kiểu dữ liệu',      'https://cdn.smartcampus.edu.vn/materials/java/variables.pdf',    'PDF'),
(3, 3, 'Tài liệu lớp và đối tượng',       'https://cdn.smartcampus.edu.vn/materials/java/oop.pdf',          'PDF'),
(4, 5, 'Bài giảng chuẩn hóa 1NF-3NF',     'https://cdn.smartcampus.edu.vn/materials/db/normalization.pdf',  'PDF'),
(5, 6, 'Video truy vấn SELECT',           'https://cdn.smartcampus.edu.vn/materials/db/select.mp4',         'VIDEO'),
(6, 7, 'Video giải thích Stack',          'https://cdn.smartcampus.edu.vn/materials/dsa/stack.mp4',         'VIDEO'),
(7, 9, 'Slide tìm kiếm nhị phân',         'https://cdn.smartcampus.edu.vn/materials/dsa/binary-search.pdf', 'PDF');

-- ============================================================
-- 10. learning_progress
-- ============================================================
INSERT INTO learning_progress (id, student_id, lesson_id, is_completed, last_position) VALUES
(1, 3, 1, TRUE,  600),
(2, 3, 2, TRUE,  900),
(3, 3, 3, FALSE, 120),
(4, 3, 7, TRUE,  480),
(5, 5, 1, TRUE,  600),
(6, 5, 2, FALSE, 300),
(7, 6, 1, FALSE, 90),
(8, 6, 7, FALSE, 60);

-- ============================================================
-- 11. learning_activities
-- ============================================================
INSERT INTO learning_activities (id, student_id, lesson_id, event_type, current_position, total_length, created_at) VALUES
(1, 3, NULL, 'LOGIN',       NULL, NULL, '2026-10-01 07:55:00'),
(2, 3, 1,    'VIDEO_PLAY',  0,    600,  '2026-10-01 08:00:00'),
(3, 3, 1,    'VIDEO_END',   600,  600,  '2026-10-01 08:10:00'),
(4, 3, 2,    'VIDEO_PAUSE', 450,  900,  '2026-10-02 19:00:00'),
(5, 5, 1,    'VIDEO_END',   600,  600,  '2026-10-03 20:00:00'),
(6, 5, 2,    'VIDEO_PAUSE', 300,  900,  '2026-10-04 20:30:00'),
(7, 6, 1,    'VIDEO_PAUSE', 90,   600,  '2026-10-05 21:00:00'),
(8, 6, 7,    'LESSON_VIEW', NULL, NULL, '2026-10-06 21:15:00');

-- ============================================================
-- 12. question_bank
-- ============================================================
INSERT INTO question_bank (id, course_id, content, question_type, answer_data) VALUES
(1,  1, 'Từ khóa nào dùng để kế thừa lớp trong Java?', 'SINGLE_CHOICE',
    JSON_OBJECT('options', JSON_ARRAY(
        JSON_OBJECT('key','A','text','implements'),
        JSON_OBJECT('key','B','text','extends'),
        JSON_OBJECT('key','C','text','inherits'),
        JSON_OBJECT('key','D','text','super')),
        'correct', JSON_ARRAY('B'))),
(2,  1, 'Những kiểu nào sau đây là kiểu dữ liệu nguyên thủy trong Java?', 'MULTIPLE_CHOICE',
    JSON_OBJECT('options', JSON_ARRAY(
        JSON_OBJECT('key','A','text','int'),
        JSON_OBJECT('key','B','text','String'),
        JSON_OBJECT('key','C','text','boolean'),
        JSON_OBJECT('key','D','text','double')),
        'correct', JSON_ARRAY('A','C','D'))),
(3,  1, 'Java hỗ trợ đa kế thừa giữa các lớp.', 'TRUE_FALSE',
    JSON_OBJECT('correct', FALSE)),
(4,  1, 'JVM là viết tắt của cụm từ nào?', 'SHORT_ANSWER',
    JSON_OBJECT('correct_answers', JSON_ARRAY('Java Virtual Machine'))),
(5,  2, 'Câu lệnh SQL nào dùng để truy vấn dữ liệu?', 'SINGLE_CHOICE',
    JSON_OBJECT('options', JSON_ARRAY(
        JSON_OBJECT('key','A','text','INSERT'),
        JSON_OBJECT('key','B','text','SELECT'),
        JSON_OBJECT('key','C','text','UPDATE'),
        JSON_OBJECT('key','D','text','DELETE')),
        'correct', JSON_ARRAY('B'))),
(6,  2, 'Những lệnh nào sau đây thuộc nhóm DDL?', 'MULTIPLE_CHOICE',
    JSON_OBJECT('options', JSON_ARRAY(
        JSON_OBJECT('key','A','text','CREATE'),
        JSON_OBJECT('key','B','text','INSERT'),
        JSON_OBJECT('key','C','text','ALTER'),
        JSON_OBJECT('key','D','text','DROP')),
        'correct', JSON_ARRAY('A','C','D'))),
(7,  2, 'Khóa chính (PRIMARY KEY) cho phép chứa giá trị NULL.', 'TRUE_FALSE',
    JSON_OBJECT('correct', FALSE)),
(8,  3, 'Cấu trúc dữ liệu nào hoạt động theo nguyên tắc LIFO?', 'SINGLE_CHOICE',
    JSON_OBJECT('options', JSON_ARRAY(
        JSON_OBJECT('key','A','text','Queue'),
        JSON_OBJECT('key','B','text','Stack'),
        JSON_OBJECT('key','C','text','Array'),
        JSON_OBJECT('key','D','text','Linked List')),
        'correct', JSON_ARRAY('B'))),
(9,  3, 'Độ phức tạp thời gian của tìm kiếm nhị phân là gì?', 'SINGLE_CHOICE',
    JSON_OBJECT('options', JSON_ARRAY(
        JSON_OBJECT('key','A','text','O(n)'),
        JSON_OBJECT('key','B','text','O(log n)'),
        JSON_OBJECT('key','C','text','O(n log n)'),
        JSON_OBJECT('key','D','text','O(1)')),
        'correct', JSON_ARRAY('B'))),
(10, 3, 'Nêu tên một thuật toán sắp xếp chia để trị có độ phức tạp trung bình O(n log n).', 'SHORT_ANSWER',
    JSON_OBJECT('correct_answers', JSON_ARRAY('Merge Sort', 'Quick Sort')));

-- ============================================================
-- 13. assessments
-- ============================================================
INSERT INTO assessments (id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts) VALUES
(1, 1, 'Quiz 1 - Java cơ bản',          'PUBLISHED', '2026-10-01 00:00:00', '2026-10-31 23:59:00', 30, 3),
(2, 1, 'Kiểm tra giữa kỳ Java',         'CLOSED',    '2026-09-15 08:00:00', '2026-09-15 10:00:00', 60, 1),
(3, 2, 'Quiz SQL cơ bản',               'PUBLISHED', '2026-10-05 00:00:00', '2026-11-05 23:59:00', 20, 2),
(4, 3, 'Quiz Stack và Tìm kiếm',        'PUBLISHED', '2026-10-10 00:00:00', '2026-11-10 23:59:00', 25, 2),
(5, 1, 'Bài kiểm tra cuối kỳ Java',     'DRAFT',     NULL,                  NULL,                  90, 1);

-- ============================================================
-- 14. assessment_questions
-- ============================================================
INSERT INTO assessment_questions (assessment_id, question_id, order_index, points) VALUES
(1, 1, 0, 3.00),
(1, 2, 1, 4.00),
(1, 3, 2, 3.00),
(2, 3, 0, 5.00),
(2, 4, 1, 5.00),
(3, 5, 0, 4.00),
(3, 6, 1, 3.00),
(3, 7, 2, 3.00),
(4, 8, 0, 4.00),
(4, 9, 1, 3.00),
(4, 10, 2, 3.00),
(5, 1, 0, 3.00),
(5, 2, 1, 4.00),
(5, 4, 2, 3.00);

-- ============================================================
-- 15. assessment_attempts
-- ============================================================
INSERT INTO assessment_attempts (id, assessment_id, student_id, attempt_number, start_time, submit_time, score, status) VALUES
(1, 1, 3, 1, '2026-10-05 09:00:00', '2026-10-05 09:20:00',  7.00, 'GRADED'),
(2, 1, 3, 2, '2026-10-07 09:00:00', '2026-10-07 09:15:00', 10.00, 'GRADED'),
(3, 1, 5, 1, '2026-10-06 20:00:00', '2026-10-06 20:25:00',  6.00, 'GRADED'),
(4, 1, 6, 1, '2026-10-08 21:00:00', '2026-10-08 21:28:00',  NULL, 'SUBMITTED'),
(5, 3, 3, 1, '2026-10-12 10:00:00', '2026-10-12 10:15:00',  7.00, 'GRADED'),
(6, 3, 5, 1, '2026-10-20 20:00:00', NULL,                   NULL, 'IN_PROGRESS'),
(7, 4, 3, 1, '2026-10-15 15:00:00', '2026-10-15 15:20:00',  8.00, 'GRADED');

-- ============================================================
-- 16. attempt_answers
-- ============================================================
INSERT INTO attempt_answers (id, attempt_id, question_id, answer_data, is_correct, score, feedback) VALUES
-- Attempt 1: student (Quiz 1 Java, lần 1) = 3 + 4 + 0
(1,  1, 1,  JSON_OBJECT('selected', JSON_ARRAY('B')),           TRUE,  3.00, NULL),
(2,  1, 2,  JSON_OBJECT('selected', JSON_ARRAY('A','C','D')),   TRUE,  4.00, NULL),
(3,  1, 3,  JSON_OBJECT('selected', TRUE),                      FALSE, 0.00, 'Java không hỗ trợ đa kế thừa lớp, chỉ hỗ trợ qua interface.'),
-- Attempt 2: student (lần 2) = 10/10
(4,  2, 1,  JSON_OBJECT('selected', JSON_ARRAY('B')),           TRUE,  3.00, NULL),
(5,  2, 2,  JSON_OBJECT('selected', JSON_ARRAY('A','C','D')),   TRUE,  4.00, NULL),
(6,  2, 3,  JSON_OBJECT('selected', FALSE),                     TRUE,  3.00, NULL),
-- Attempt 3: student02 = 3 + 0 + 3
(7,  3, 1,  JSON_OBJECT('selected', JSON_ARRAY('B')),           TRUE,  3.00, NULL),
(8,  3, 2,  JSON_OBJECT('selected', JSON_ARRAY('A','B')),       FALSE, 0.00, 'String không phải kiểu nguyên thủy.'),
(9,  3, 3,  JSON_OBJECT('selected', FALSE),                     TRUE,  3.00, NULL),
-- Attempt 4: student03 đã nộp, chưa chấm
(10, 4, 1,  JSON_OBJECT('selected', JSON_ARRAY('A')),           NULL,  NULL, NULL),
(11, 4, 2,  JSON_OBJECT('selected', JSON_ARRAY('A','C')),       NULL,  NULL, NULL),
(12, 4, 3,  JSON_OBJECT('selected', FALSE),                     NULL,  NULL, NULL),
-- Attempt 5: student (Quiz SQL) = 4 + 3 + 0
(13, 5, 5,  JSON_OBJECT('selected', JSON_ARRAY('B')),           TRUE,  4.00, NULL),
(14, 5, 6,  JSON_OBJECT('selected', JSON_ARRAY('A','C','D')),   TRUE,  3.00, NULL),
(15, 5, 7,  JSON_OBJECT('selected', TRUE),                      FALSE, 0.00, 'Khóa chính không được phép NULL.'),
-- Attempt 6: student02 đang làm dở
(16, 6, 5,  JSON_OBJECT('selected', JSON_ARRAY('B')),           NULL,  NULL, NULL),
-- Attempt 7: student (Quiz Stack & Tìm kiếm) = 4 + 3 + 1
(17, 7, 8,  JSON_OBJECT('selected', JSON_ARRAY('B')),           TRUE,  4.00, NULL),
(18, 7, 9,  JSON_OBJECT('selected', JSON_ARRAY('B')),           TRUE,  3.00, NULL),
(19, 7, 10, JSON_OBJECT('text', 'Sắp xếp nổi bọt'),             FALSE, 1.00, 'Bubble Sort là O(n^2); điểm cho phần trình bày. Đáp án đúng: Merge Sort/Quick Sort.');

-- ============================================================
-- 17. risk_assessments
-- ============================================================
INSERT INTO risk_assessments (id, student_id, course_id, risk_score, risk_level, assessed_at) VALUES
(1, 3, 1, 12.50, 'LOW',    '2026-10-10 06:00:00'),
(2, 5, 1, 48.00, 'MEDIUM', '2026-10-10 06:00:00'),
(3, 6, 1, 60.00, 'MEDIUM', '2026-10-10 06:00:00'),
(4, 6, 1, 82.50, 'HIGH',   '2026-10-17 06:00:00'),
(5, 5, 2, 74.00, 'HIGH',   '2026-10-17 06:00:00'),
(6, 6, 3, 68.00, 'MEDIUM', '2026-10-17 06:00:00');

-- ============================================================
-- 18. risk_factors
-- ============================================================
INSERT INTO risk_factors (id, risk_assessment_id, factor_type, factor_value, description) VALUES
(1, 1, 'LOW_PROGRESS',      10.00, 'Tiến độ học tốt, rủi ro thấp.'),
(2, 2, 'LOW_PROGRESS',      45.00, 'Mới hoàn thành 1/3 bài học trong khóa.'),
(3, 2, 'LOW_SCORE',          6.00, 'Điểm Quiz 1 chỉ đạt 6/10.'),
(4, 3, 'INACTIVITY',         5.00, 'Không đăng nhập trong 5 ngày.'),
(5, 4, 'LOW_PROGRESS',      85.00, 'Chưa hoàn thành bài học nào trong khóa.'),
(6, 4, 'INACTIVITY',        10.00, 'Không hoạt động học tập trong 10 ngày.'),
(7, 4, 'MISSED_DEADLINE',    1.00, 'Chưa chấm/hoàn thành Quiz 1 đúng tiến độ.'),
(8, 5, 'LOW_PROGRESS',      70.00, 'Chưa hoàn thành bài học nào của khóa Cơ sở dữ liệu.'),
(9, 5, 'MISSED_DEADLINE',    1.00, 'Quiz SQL còn đang làm dở.'),
(10,6, 'LOW_PROGRESS',      68.00, 'Tiến độ khóa Cấu trúc dữ liệu thấp.');

-- ============================================================
-- 19. interventions
-- ============================================================
INSERT INTO interventions (id, risk_assessment_id, created_by, intervention_type, description, status, created_at, completed_at) VALUES
(1, 2, 2, 'EMAIL_REMINDER', 'Gửi email nhắc nhở hoàn thành các bài học còn lại.',              'COMPLETED',   '2026-10-10 08:00:00', '2026-10-11 09:00:00'),
(2, 3, 2, 'MEETING',        'Hẹn gặp sinh viên để tìm hiểu khó khăn trong học tập.',          'CANCELLED',   '2026-10-10 08:30:00', NULL),
(3, 4, 2, 'EMAIL_REMINDER', 'Gửi email cảnh báo nguy cơ rớt môn Java.',                        'COMPLETED',   '2026-10-17 08:00:00', '2026-10-17 10:00:00'),
(4, 4, 2, 'MEETING',        'Gặp trực tiếp sinh viên để xây dựng kế hoạch học bù.',            'IN_PROGRESS', '2026-10-18 08:00:00', NULL),
(5, 5, 2, 'TUTORING',       'Sắp xếp buổi phụ đạo SQL cho sinh viên.',                         'OPEN',        '2026-10-18 09:00:00', NULL),
(6, 6, 4, 'EMAIL_REMINDER', 'Nhắc sinh viên hoàn thành Bài 1 - Cấu trúc Stack.',               'OPEN',        '2026-10-18 09:30:00', NULL);

-- ============================================================
-- 20. notifications
-- ============================================================
INSERT INTO notifications (id, recipient_id, type, title, message, link, is_read, created_at, read_at) VALUES
(1, 3, 'NEW_CONTENT',  'Có bài học mới',            'Bài 3: Lớp và đối tượng vừa được đăng trong khóa Lập trình Java cơ bản.', '/courses/1/lessons/3',       TRUE,  '2026-10-02 08:00:00', '2026-10-02 08:30:00'),
(2, 3, 'GRADED',       'Bài kiểm tra đã có điểm',   'Quiz 1 - Java cơ bản (lần 2) của bạn đạt 10.00 điểm.',                    '/assessments/1/attempts/2',TRUE, '2026-10-07 09:20:00', '2026-10-07 10:00:00'),
(3, 5, 'GRADED',       'Bài kiểm tra đã có điểm',   'Quiz 1 - Java cơ bản của bạn đạt 6.00 điểm.',                             '/assessments/1/attempts/3',FALSE, '2026-10-06 20:30:00', NULL),
(4, 6, 'DEADLINE',     'Sắp đến hạn làm bài',       'Quiz 1 - Java cơ bản sẽ đóng vào 31/10/2026.',                            '/assessments/1',           FALSE, '2026-10-20 07:00:00', NULL),
(5, 6, 'RISK_ALERT',   'Cảnh báo nguy cơ học tập',  'Bạn đang ở mức rủi ro CAO trong khóa Lập trình Java cơ bản.',             '/courses/1/risk',          FALSE, '2026-10-17 06:30:00', NULL),
(6, 2, 'RISK_ALERT',   'Sinh viên có rủi ro cao',   'Sinh viên Võ Thu Hà đang ở mức rủi ro CAO trong khóa Java.',              '/courses/1/risk/students/6', TRUE, '2026-10-17 06:30:00', '2026-10-17 07:00:00'),
(7, 2, 'NEW_ENROLLMENT','Sinh viên mới đăng ký',    'Đặng Hoàng Nam vừa đăng ký khóa Cơ sở dữ liệu.',                          '/courses/2/roster',        TRUE,  '2026-09-12 13:00:00', '2026-09-12 14:00:00'),
(8, 8, 'ENROLLMENT_REMOVED','Bạn đã bị loại khỏi khóa học','Giảng viên đã loại bạn khỏi khóa Lập trình Java cơ bản.',            '/courses/1',               FALSE, '2026-10-12 14:00:00', NULL);