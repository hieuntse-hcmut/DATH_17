-- SMART CAMPUS: REPLACE EXISTING SEED DATA WITH RICH SAMPLE DATA
-- IMPORTANT: Back up the database before running this script.
-- Safety guard: only run when ALL existing users are the three seed_* accounts,
-- or the users table is empty. Any other user causes an immediate error.
-- Does NOT drop tables, schema, or flyway_schema_history.
-- Do not run on production with real users.

DELIMITER $$
DROP PROCEDURE IF EXISTS assert_only_old_seed_users$$
CREATE PROCEDURE assert_only_old_seed_users()
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE username NOT IN
       ('seed_admin', 'seed_lecturer', 'seed_student')) THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'ABORT: Non-seed user exists. No data has been deleted.';
    END IF;
END$$
DELIMITER ;
CALL assert_only_old_seed_users();
DROP PROCEDURE assert_only_old_seed_users;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DỌN DẸP DỮ LIỆU CŨ ĐỂ CHẠY LẠI KHÔNG BỊ TRÙNG LẶP
DELETE FROM attempt_answers       WHERE 1=1;
DELETE FROM assessment_attempts   WHERE 1=1;
DELETE FROM assessment_questions  WHERE 1=1;
DELETE FROM question_options      WHERE 1=1;
DELETE FROM question_bank         WHERE 1=1;
DELETE FROM assessments           WHERE 1=1;
DELETE FROM course_discussions    WHERE 1=1;
DELETE FROM notifications         WHERE 1=1;
DELETE FROM learning_activities   WHERE 1=1;
DELETE FROM learning_progress     WHERE 1=1;
DELETE FROM learning_materials    WHERE 1=1;
DELETE FROM lessons               WHERE 1=1;
DELETE FROM chapters              WHERE 1=1;
DELETE FROM enrollment_histories  WHERE 1=1;
DELETE FROM enrollments           WHERE 1=1;
DELETE FROM course_lecturers      WHERE 1=1;
DELETE FROM courses               WHERE 1=1;
DELETE FROM audit_logs            WHERE 1=1;
DELETE FROM users                 WHERE 1=1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 2. TÀI KHOẢN NGƯỜI DÙNG (1 Admin, 3 Giảng viên, 10 Sinh viên)
-- Password: "123456"
-- ============================================================================
INSERT INTO users (id, username, password_hash, full_name, email, role, status)
VALUES
    -- Admin
    (1001, 'admin',          '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Quản trị viên Hệ thống', 'admin@smartcampus.edu.vn',       'ADMIN',    'ACTIVE'),

    -- 3 Giảng viên
    (1002, 'lecturer01',     '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Giảng viên 01',          'lecturer01@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),
    (1003, 'lecturer02',     '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Giảng viên 02',          'lecturer02@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),
    (1004, 'lecturer03',     '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Giảng viên 03',          'lecturer03@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),

    -- 10 Sinh viên
    (1011, 'student01',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 01',           'student01@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1012, 'student02',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 02',           'student02@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1013, 'student03',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 03',           'student03@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1014, 'student04',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 04',           'student04@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1015, 'student05',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 05',           'student05@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1016, 'student06',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 06',           'student06@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1017, 'student07',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 07',           'student07@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1018, 'student08',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 08',           'student08@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1019, 'student09',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 09',           'student09@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
    (1020, 'student10',      '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Sinh viên 10',           'student10@smartcampus.edu.vn',  'STUDENT',  'ACTIVE');

-- ============================================================================
-- 3. CÁC KHÓA HỌC (COURSES & COURSE_LECTURERS)
-- ============================================================================
INSERT INTO courses (id, title, description, publication_state, is_enrollment_open, created_by)
VALUES
    (101, 'Lập trình Web nâng cao với Spring Boot & React', 
          'Khóa học trang bị kiến thức kiến trúc Fullstack, RESTful API, bảo mật JWT, React Hooks và tối ưu hoá giao diện người dùng.', 
          'PUBLISHED', TRUE, 1002),

    (102, 'Cấu trúc Dữ liệu & Giải thuật nâng cao', 
          'Nắm vững cây nhị phân, đồ thị, quy hoạch động và các kỹ thuật tối ưu thuật toán giải quyết bài toán quy mô lớn.', 
          'PUBLISHED', TRUE, 1003),

    (103, 'Kiến trúc Microservices với Docker & Kubernetes', 
          'Xây dựng hệ thống phân tán, containerization, service discovery, API gateway và triển khai production.', 
          'PUBLISHED', TRUE, 1004),

    (104, 'Trí tuệ nhân tạo & Máy học thực hành', 
          'Lý thuyết và bài tập về Supervised Learning, Deep Learning với PyTorch và xây dựng mô hình AI nhận dạng ảnh.', 
          'PUBLISHED', FALSE, 1002),

    (105, 'Lập trình Ứng dụng Di động với Flutter', 
          'Xây dựng ứng dụng đa nền tảng iOS & Android với Flutter framework, Bloc pattern và Firebase backend.', 
          'DRAFT', TRUE, 1003),

    (106, 'Nhập môn Khoa học Máy tính (Khoá 2025)', 
          'Khóa học nền tảng dành cho sinh viên năm nhất về kiến trúc máy tính, hệ điều hành và tư duy giải thuật.', 
          'ARCHIVED', FALSE, 1004);

INSERT INTO course_lecturers (course_id, lecturer_id)
VALUES
    (101, 1002), -- Giảng viên 01 (lecturer01)
    (102, 1003), -- Giảng viên 02 (lecturer02)
    (103, 1004), -- Giảng viên 03 (lecturer03)
    (104, 1002), -- Giảng viên 01 (lecturer01)
    (105, 1003), -- Giảng viên 02 (lecturer02)
    (106, 1004); -- Giảng viên 03 (lecturer03)

-- ============================================================================
-- 4. CHƯƠNG MỤC (CHAPTERS)
-- ============================================================================
INSERT INTO chapters (id, course_id, title, order_index)
VALUES
    -- Khóa 101: Web Spring Boot & React
    (201, 101, 'Chương 1: Tổng quan Kiến trúc & Thiết lập môi trường', 0),
    (202, 101, 'Chương 2: Xây dựng RESTful API với Spring Boot 3',   1),
    (203, 101, 'Chương 3: Phát triển giao diện người dùng với React', 2),

    -- Khóa 102: DSA
    (204, 102, 'Chương 1: Phân tích độ phức tạp thuật toán (Big-O)',   0),
    (205, 102, 'Chương 2: Thuật toán trên Đồ thị (Graph Algorithms)', 1),

    -- Khóa 103: Microservices
    (206, 103, 'Chương 1: Container hóa ứng dụng với Docker',          0),
    (207, 103, 'Chương 2: Điều phối container với Kubernetes',         1);

-- ============================================================================
-- 5. BÀI HỌC (LESSONS)
-- Lưu ý: total_length để NULL đối với bài Video để hệ thống tự động ghi nhận
-- độ dài thực tế từ YouTube clip khi người dùng mở xem!
-- ============================================================================
INSERT INTO lessons (id, chapter_id, title, order_index, total_length)
VALUES
    -- Khóa 101 - Chương 1
    (301, 201, '1.1 Tổng quan dự án Smart Campus Fullstack (Video)', 0, NULL),
    (302, 201, '1.2 Hướng dẫn cài đặt JDK 21 & Node.js 20 (Text)',   1, NULL),
    
    -- Khóa 101 - Chương 2
    (303, 202, '2.1 Thiết kế Cơ sở dữ liệu & Spring Data JPA (PDF)', 0, 15),
    (304, 202, '2.2 Triển khai Spring Security & JWT Token (Video)',  1, NULL),
    
    -- Khóa 101 - Chương 3
    (305, 203, '3.1 React Query & Quản lý Server State (Video)',     0, NULL),
    (306, 203, '3.2 Hoàn thiện giao diện & Responsive Tailwind (Text)', 1, NULL),

    -- Khóa 102 - DSA
    (307, 204, '1.1 Phân tích thời gian chạy & Không gian bộ nhớ (Video)', 0, NULL),
    (308, 204, '1.2 Bài tập quy nạp toán học trong đệ quy (PDF)',          1, 8),

    -- Khóa 103 - Microservices
    (309, 206, '1.1 Xây dựng Dockerfile đa tầng & Tối ưu Image (Video)',   0, NULL);

-- ============================================================================
-- 6. TÀI LIỆU HỌC TẬP (LEARNING MATERIALS)
-- Sử dụng link YouTube theo yêu cầu: https://www.youtube.com/watch?v=xuP4g7IDgDM
-- ============================================================================
INSERT INTO learning_materials (id, lesson_id, title, file_url, file_type)
VALUES
    -- Bài 301 (Video YouTube)
    (401, 301, 'Video bài giảng: Tổng quan hệ thống Smart Campus', 
     'https://www.youtube.com/watch?v=xuP4g7IDgDM', 'VIDEO'),

    -- Bài 302 (Text / Tài liệu đọc)
    (402, 302, 'Tài liệu hướng dẫn cài đặt môi trường dev', 
     'https://docs.smartcampus.edu.vn/guide-setup-dev-environment.html', 'DOCUMENT'),

    -- Bài 303 (Tài liệu PDF)
    (403, 303, 'Slide bài giảng thiết kế Database & JPA schema', 
     'https://docs.smartcampus.edu.vn/slides/chapter2-jpa-database.pdf', 'DOCUMENT'),

    -- Bài 304 (Video YouTube)
    (404, 304, 'Video bài giảng: Spring Security & JWT', 
     'https://www.youtube.com/watch?v=xuP4g7IDgDM', 'VIDEO'),

    -- Bài 305 (Video YouTube)
    (405, 305, 'Video bài giảng: React Query & Frontend State', 
     'https://www.youtube.com/watch?v=xuP4g7IDgDM', 'VIDEO'),

    -- Bài 306 (Text)
    (406, 306, 'Cheatsheet Tailwind CSS và UI Components', 
     'https://docs.smartcampus.edu.vn/tailwind-cheatsheet.html', 'DOCUMENT'),

    -- Bài 307 (Video YouTube)
    (407, 307, 'Video bài giảng: Thuật toán & Phân tích Big-O', 
     'https://www.youtube.com/watch?v=xuP4g7IDgDM', 'VIDEO'),

    -- Bài 308 (PDF)
    (408, 308, 'Bài tập thực hành đệ quy & quy hoạch động', 
     'https://docs.smartcampus.edu.vn/slides/dsa-recursion-practice.pdf', 'DOCUMENT'),

    -- Bài 309 (Video YouTube)
    (409, 309, 'Video bài giảng: Dockerfile & Multi-stage build', 
     'https://www.youtube.com/watch?v=xuP4g7IDgDM', 'VIDEO');

-- ============================================================================
-- 7. GHI DANH KHÓA HỌC (ENROLLMENTS & ENROLLMENT_HISTORIES)
-- Đảm bảo sinh viên đều có trạng thái ACTIVE để test học bài mượt mà
-- ============================================================================
INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at)
VALUES
    -- Khóa 101 (Web Spring Boot & React): 8 sinh viên đăng ký học
    (501, 1011, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 7 DAY),
    (502, 1012, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 6 DAY),
    (503, 1013, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 5 DAY),
    (504, 1014, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 4 DAY),
    (505, 1015, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 3 DAY),
    (506, 1016, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 2 DAY),
    (507, 1017, 101, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 1 DAY),
    (508, 1018, 101, 'ACTIVE', CURRENT_TIMESTAMP),

    -- Khóa 102 (DSA): 4 sinh viên
    (509, 1011, 102, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 10 DAY),
    (510, 1013, 102, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 8 DAY),
    (511, 1019, 102, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 5 DAY),
    (512, 1020, 102, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 2 DAY),

    -- Khóa 103 (Microservices): 3 sinh viên
    (513, 1011, 103, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 14 DAY),
    (514, 1014, 103, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 12 DAY),
    (515, 1015, 103, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL 3 DAY);

INSERT INTO enrollment_histories (enrollment_id, previous_status, new_status, changed_by, reason)
VALUES
    (501, NULL, 'ACTIVE', 1011, 'Học viên tự đăng ký khóa học'),
    (502, NULL, 'ACTIVE', 1012, 'Học viên tự đăng ký khóa học'),
    (503, NULL, 'ACTIVE', 1013, 'Học viên tự đăng ký khóa học'),
    (504, NULL, 'ACTIVE', 1014, 'Học viên tự đăng ký khóa học'),
    (505, NULL, 'ACTIVE', 1015, 'Học viên tự đăng ký khóa học'),
    (506, NULL, 'ACTIVE', 1016, 'Học viên tự đăng ký khóa học'),
    (507, NULL, 'ACTIVE', 1017, 'Học viên tự đăng ký khóa học'),
    (508, NULL, 'ACTIVE', 1018, 'Học viên tự đăng ký khóa học'),
    (509, NULL, 'ACTIVE', 1011, 'Học viên tự đăng ký khóa học'),
    (510, NULL, 'ACTIVE', 1013, 'Học viên tự đăng ký khóa học'),
    (511, NULL, 'ACTIVE', 1019, 'Học viên tự đăng ký khóa học'),
    (512, NULL, 'ACTIVE', 1020, 'Học viên tự đăng ký khóa học'),
    (513, NULL, 'ACTIVE', 1011, 'Học viên tự đăng ký khóa học'),
    (514, NULL, 'ACTIVE', 1014, 'Học viên tự đăng ký khóa học'),
    (515, NULL, 'ACTIVE', 1015, 'Học viên tự đăng ký khóa học');

-- ============================================================================
-- 8. TIẾN ĐỘ HỌC TẬP (LEARNING PROGRESS & ACTIVITIES)
-- Tạo sẵn tiến độ mẫu cho học viên 1011 (Nguyễn Thành Đạt)
-- ============================================================================
INSERT INTO learning_progress (student_id, lesson_id, is_completed, last_position)
VALUES
    -- Đạt đã xem bài 302 (Text) hoàn thành
    (1011, 302, TRUE, 0),
    -- Đạt đã đọc xong bài 303 (PDF 15 trang)
    (1011, 303, TRUE, 15),
    -- Bài 301 chưa hoàn thành (đang ở giây 45)
    (1011, 301, FALSE, 45);

INSERT INTO learning_activities (student_id, lesson_id, event_type, current_position, total_length, created_at)
VALUES
    (1011, 301, 'LESSON_PROGRESS', 45, NULL, CURRENT_TIMESTAMP - INTERVAL 2 HOUR),
    (1011, 302, 'LESSON_COMPLETED', 0, NULL, CURRENT_TIMESTAMP - INTERVAL 1 DAY),
    (1011, 303, 'LESSON_COMPLETED', 15, 15, CURRENT_TIMESTAMP - INTERVAL 12 HOUR);

-- ============================================================================
-- 9. NGÂN HÀNG CÂU HỎI & BÀI THI TRẮC NGHIỆM (ASSESSMENT & QUESTIONS)
-- ============================================================================
INSERT INTO assessments (id, course_id, title, status, start_time, end_time, duration_minutes, max_attempts)
VALUES
    (601, 101, 'Bài kiểm tra trắc nghiệm: Tổng quan Spring Boot & React', 
     'PUBLISHED', CURRENT_TIMESTAMP - INTERVAL 1 DAY, CURRENT_TIMESTAMP + INTERVAL 30 DAY, 15, 3);

INSERT INTO question_bank (id, course_id, content, question_type)
VALUES
    (701, 101, 'Trong Spring Boot, annotation nào dùng để cấu hình một class thành REST Controller?', 'SINGLE_CHOICE'),
    (702, 101, 'Hook nào trong React dùng để quản lý side-effects như gọi API hay lắng nghe sự kiện?', 'SINGLE_CHOICE'),
    (703, 101, 'Mặc định mã HTTP Status trả về khi tài nguyên được tạo mới thành công là gì?', 'SINGLE_CHOICE');

INSERT INTO question_options (question_id, content, is_correct, order_index)
VALUES
    (701, '@Controller', FALSE, 0),
    (701, '@RestController', TRUE, 1),
    (701, '@Service', FALSE, 2),
    (701, '@Repository', FALSE, 3),

    (702, 'useState', FALSE, 0),
    (702, 'useMemo', FALSE, 1),
    (702, 'useEffect', TRUE, 2),
    (702, 'useCallback', FALSE, 3),

    (703, '200 OK', FALSE, 0),
    (703, '201 Created', TRUE, 1),
    (703, '204 No Content', FALSE, 2),
    (703, '400 Bad Request', FALSE, 3);

INSERT INTO assessment_questions (assessment_id, question_id, order_index, points)
VALUES
    (601, 701, 0, 3.50),
    (601, 702, 1, 3.50),
    (601, 703, 2, 3.00);

-- ============================================================================
-- 10. THẢO LUẬN KHÓA HỌC (COURSE DISCUSSIONS)
-- ============================================================================
INSERT INTO course_discussions (id, course_id, author_id, parent_id, content, is_deleted)
VALUES
    (801, 101, 1011, NULL, 'Thưa thầy, em xem clip bài 1.1 đến 90% thì hệ thống tự động tick xanh hoàn thành rồi ạ. Rất mượt!', FALSE),
    (802, 101, 1002, 801,  'Tuyệt vời em nhé! Hãy tiếp tục với bài 1.2 cài đặt môi trường và làm bài Quiz Chương 1.', FALSE),
    (803, 101, 1012, NULL, 'Khóa học thiết kế lộ trình rất rõ ràng, tài liệu PDF đọc rất dễ hiểu.', FALSE);

-- ============================================================================
-- 11. THÔNG BÁO (NOTIFICATIONS)
-- ============================================================================
INSERT INTO notifications (recipient_id, type, title, message, link, is_read)
VALUES
    (1011, 'NEW_CONTENT', 'Khóa học mới đã sẵn sàng', 
     'Chào mừng bạn đến với khóa học Lập trình Web với Spring Boot & React. Hãy bắt đầu bài học đầu tiên ngay!', 
     '/courses/101/lessons', FALSE),
    (1011, 'NEW_CONTENT', 'Bài kiểm tra trắc nghiệm mở', 
     'Bài kiểm tra Chương 1 đã mở, thời lượng 15 phút.', 
     '/courses/101/quizzes/601', FALSE),
    (1002, 'SYSTEM', 'Sinh viên mới tham gia khóa học', 
     'Sinh viên 01 (student01) vừa đăng ký vào khóa học của bạn.', 
     '/courses/101/lessons', TRUE);

-- ============================================================================
-- HOÀN TẤT NẠP DỮ LIỆU MẪU
-- ============================================================================
