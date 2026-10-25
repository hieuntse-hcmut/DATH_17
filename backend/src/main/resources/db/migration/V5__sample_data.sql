-- V5__sample_data.sql
-- Smart Campus LMS - Massive Scale Sample Data (DEV / DEMO)
-- Target: 3 Students, 12 Courses, 60+ Lessons, Full V1-V4 compliance

-- ============================================================
-- 1. USERS (1 Admin, 3 Lecturers, 3 Students)
-- ============================================================
INSERT INTO users (id, username, password_hash, full_name, email, role, status) VALUES
(1, 'admin',      '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Quản Trị Viên',     'admin@smartcampus.edu.vn',      'ADMIN',    'ACTIVE'),
(2, 'lecturer01', '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Nguyễn Văn Giảng',  'lecturer01@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),
(4, 'lecturer02', '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Lê Minh Tuấn',      'lecturer02@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),
(9, 'lecturer03', '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Hoàng Thị Trúc',    'lecturer03@smartcampus.edu.vn', 'LECTURER', 'ACTIVE'),
(3, 'student01',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Trần Thị Sinh',     'student01@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
(5, 'student02',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Phạm Quốc Bảo',     'student02@smartcampus.edu.vn',  'STUDENT',  'ACTIVE'),
(6, 'student03',  '$2a$10$Gm8fYBfTsc8imZ1eHin5/u.7OmRK7uD0/6jDCTlUDuRJQcddvLV6a', 'Võ Thu Hà',         'student03@smartcampus.edu.vn',  'STUDENT',  'ACTIVE');

-- ============================================================
-- 2. COURSES (12 Khóa học)
-- ============================================================
INSERT INTO courses (id, title, description, publication_state, is_enrollment_open, created_by) VALUES
(1,  'Lập trình Java Core',            'Nền tảng Java từ cơ bản đến nâng cao.',                 'PUBLISHED', TRUE,  2),
(2,  'Cơ sở dữ liệu Quan Hệ (SQL)',    'Thiết kế ERD và SQL chuyên sâu.',                       'PUBLISHED', TRUE,  2),
(3,  'Cấu trúc dữ liệu & Giải thuật',  'Phân tích Big O, Array, Tree, Graph.',                  'PUBLISHED', TRUE,  4),
(4,  'Nhập môn Machine Learning',      'Thuật toán học có giám sát và không giám sát.',         'PUBLISHED', TRUE,  4),
(5,  'Phát triển Web với Spring Boot', 'REST API, Security, JPA.',                              'PUBLISHED', TRUE,  9),
(6,  'Thiết kế UI/UX',                 'Figma, Wireframing, Prototyping.',                      'PUBLISHED', TRUE,  9),
(7,  'Kiến trúc Microservices',        'Docker, Kubernetes, API Gateway.',                      'PUBLISHED', FALSE, 4),
(8,  'Lập trình Frontend ReactJS',     'Hooks, Redux, Context API.',                            'PUBLISHED', TRUE,  2),
(9,  'Cloud Computing (AWS)',          'EC2, S3, RDS, Lambda cơ bản.',                          'PUBLISHED', TRUE,  4),
(10, 'An toàn thông tin (Security)',   'OWASP Top 10, Mã hóa dữ liệu.',                         'PUBLISHED', TRUE,  9),
(11, 'DevOps CI/CD',                   'Jenkins, GitHub Actions, GitLab CI.',                   'DRAFT',     FALSE, 4),
(12, 'Quản lý dự án Agile/Scrum',      'Sprint, Jira, Scrum Master role.',                      'ARCHIVED',  FALSE, 2);

INSERT INTO course_lecturers (course_id, lecturer_id) VALUES
(1,2), (2,2), (3,4), (4,4), (5,9), (6,9), (7,4), (8,2), (9,4), (10,9), (11,4), (12,2);

-- ============================================================
-- 3. ENROLLMENTS (3 Students across 12 courses - Status: ACTIVE, WITHDRAWN, REMOVED)
-- ============================================================
INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at) VALUES
-- Student 3 (Trần Thị Sinh)
(1, 3, 1, 'ACTIVE',    '2026-09-01 08:00:00'),
(2, 3, 2, 'ACTIVE',    '2026-09-02 08:00:00'),
(3, 3, 5, 'ACTIVE',    '2026-09-03 08:00:00'),
(4, 3, 8, 'WITHDRAWN', '2026-09-04 08:00:00'),
-- Student 5 (Phạm Quốc Bảo)
(5, 5, 1, 'ACTIVE',    '2026-09-01 09:00:00'),
(6, 5, 3, 'ACTIVE',    '2026-09-02 09:00:00'),
(7, 5, 4, 'ACTIVE',    '2026-09-03 09:00:00'),
(8, 5, 9, 'REMOVED',   '2026-09-04 09:00:00'),
(9, 5, 10,'ACTIVE',    '2026-09-05 09:00:00'),
-- Student 6 (Võ Thu Hà)
(10,6, 2, 'ACTIVE',    '2026-09-01 10:00:00'),
(11,6, 6, 'ACTIVE',    '2026-09-02 10:00:00'),
(12,6, 8, 'ACTIVE',    '2026-09-03 10:00:00'),
(13,6, 12,'REMOVED',   '2026-09-04 10:00:00');

INSERT INTO enrollment_histories (id, enrollment_id, previous_status, new_status, changed_by, reason) VALUES
(1, 4, 'ACTIVE', 'WITHDRAWN', 3, 'Tự rút môn học do lịch chồng chéo'),
(2, 8, 'ACTIVE', 'REMOVED',   4, 'Giảng viên loại do vắng mặt quá 20%'),
(3, 13,'ACTIVE', 'REMOVED',   2, 'Khóa học đã bị đóng/archived');

-- ============================================================
-- 4. CHAPTERS & LESSONS
-- ============================================================
-- C1: Java (4 Chương, 13 Bài)
INSERT INTO chapters (id, course_id, title, order_index) VALUES 
(1,1,'Chương 1: Biến & Dữ liệu',0), (2,1,'Chương 2: OOP',1), (3,1,'Chương 3: Collections',2), (4,1,'Chương 4: Multithreading',3);
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(1,1,'Cài đặt môi trường', 'VIDEO',0), (2,1,'Kiểu dữ liệu', 'DOCUMENT',1), (3,1,'Vòng lặp & Điều kiện', 'VIDEO',2),
(4,2,'Class & Object', 'VIDEO',0), (5,2,'Đóng gói & Kế thừa', 'DOCUMENT',1), (6,2,'Đa hình', 'DOCUMENT',2), (7,2,'Interface & Abstract', 'VIDEO',3),
(8,3,'List & ArrayList', 'DOCUMENT',0), (9,3,'Set & HashSet', 'DOCUMENT',1), (10,3,'Map & HashMap', 'VIDEO',2),
(11,4,'Khái niệm Thread', 'DOCUMENT',0), (12,4,'Runnable Interface', 'VIDEO',1), (13,4,'Đồng bộ hóa (Synchronization)', 'DOCUMENT',2);

-- C2: SQL (4 Chương, 12 Bài)
INSERT INTO chapters (id, course_id, title, order_index) VALUES 
(5,2,'Chương 1: Mô hình ERD',0), (6,2,'Chương 2: DDL & DML',1), (7,2,'Chương 3: JOIN & Grouping',2), (8,2,'Chương 4: Advanced SQL',3);
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(14,5,'Thực thể và Khóa', 'VIDEO',0), (15,5,'Chuẩn hóa 1NF-3NF', 'DOCUMENT',1), (16,5,'Thiết kế logic', 'DOCUMENT',2),
(17,6,'Lệnh CREATE, ALTER', 'VIDEO',0), (18,6,'Lệnh INSERT, UPDATE', 'VIDEO',1), (19,6,'Lệnh SELECT cơ bản', 'DOCUMENT',2),
(20,7,'INNER & OUTER JOIN', 'VIDEO',0), (21,7,'GROUP BY & HAVING', 'VIDEO',1), (22,7,'Subqueries', 'DOCUMENT',2),
(23,8,'Stored Procedures', 'VIDEO',0), (24,8,'Triggers', 'VIDEO',1), (25,8,'Index & Optimization', 'DOCUMENT',2);

-- C3: Data Structures (3 Chương, 9 Bài)
INSERT INTO chapters (id, course_id, title, order_index) VALUES 
(9,3,'Chương 1: Tuyến tính',0), (10,3,'Chương 2: Phi tuyến tính',1), (11,3,'Chương 3: Thuật toán sắp xếp',2);
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(26,9,'Mảng & Danh sách liên kết', 'VIDEO',0), (27,9,'Stack (Ngăn xếp)', 'DOCUMENT',1), (28,9,'Queue (Hàng đợi)', 'VIDEO',2),
(29,10,'Binary Tree', 'VIDEO',0), (30,10,'Binary Search Tree', 'VIDEO',1), (31,10,'Đồ thị (Graph)', 'DOCUMENT',2),
(32,11,'Bubble & Insertion Sort', 'VIDEO',0), (33,11,'Merge Sort', 'DOCUMENT',1), (34,11,'Quick Sort', 'VIDEO',2);

-- C5: Spring Boot (4 Chương, 11 Bài)
INSERT INTO chapters (id, course_id, title, order_index) VALUES 
(12,5,'Chương 1: Core Spring',0), (13,5,'Chương 2: RESTful API',1), (14,5,'Chương 3: Spring Data JPA',2), (15,5,'Chương 4: Spring Security',3);
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(35,12,'IoC Container', 'VIDEO',0), (36,12,'Dependency Injection', 'DOCUMENT',1),
(37,13,'@RestController & @RequestMapping', 'VIDEO',0), (38,13,'Xử lý Exception', 'DOCUMENT',1), (39,13,'Data Transfer Object (DTO)', 'VIDEO',2),
(40,14,'Cấu hình Datasource', 'DOCUMENT',0), (41,14,'Entity Mapping', 'DOCUMENT',1), (42,14,'JPA Repositories', 'VIDEO',2),
(43,15,'Authentication vs Authorization', 'DOCUMENT',0), (44,15,'JWT Token Implementation', 'VIDEO',1), (45,15,'Role-based Access Control', 'VIDEO',2);

-- C8: ReactJS (3 Chương, 10 Bài)
INSERT INTO chapters (id, course_id, title, order_index) VALUES 
(16,8,'Chương 1: React Basics',0), (17,8,'Chương 2: Hooks',1), (18,8,'Chương 3: State Management',2);
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(46,16,'JSX & Virtual DOM', 'VIDEO',0), (47,16,'Components & Props', 'DOCUMENT',1), (48,16,'Event Handling', 'VIDEO',2), (49,16,'Conditional Rendering', 'VIDEO',3),
(50,17,'useState', 'VIDEO',0), (51,17,'useEffect', 'VIDEO',1), (52,17,'useRef & useMemo', 'DOCUMENT',2),
(53,18,'Context API', 'VIDEO',0), (54,18,'Giới thiệu Redux', 'DOCUMENT',1), (55,18,'Redux Toolkit', 'VIDEO',2);

-- C9: AWS (2 Chương, 6 Bài)
INSERT INTO chapters (id, course_id, title, order_index) VALUES 
(19,9,'Chương 1: Compute & Storage',0), (20,9,'Chương 2: Networking & DB',1);
INSERT INTO lessons (id, chapter_id, title, content_type, order_index) VALUES
(56,19,'EC2 Instances', 'VIDEO',0), (57,19,'S3 Buckets', 'DOCUMENT',1), (58,19,'Lambda Serverless', 'VIDEO',2),
(59,20,'VPC cơ bản', 'VIDEO',0), (60,20,'RDS (Relational Database)', 'DOCUMENT',1), (61,20,'DynamoDB', 'VIDEO',2);

-- ============================================================
-- 5. LEARNING PROGRESS
-- ============================================================
INSERT INTO learning_progress (id, student_id, lesson_id, is_completed, last_position) VALUES
-- Student 3 (Java & Spring Boot)
(1, 3, 1, TRUE, 600), 
(2, 3, 2, FALSE, 0),   
(3, 3, 3, FALSE, 150),
(4, 3, 35, TRUE, 900), 
(5, 3, 36, FALSE, 0),  

-- Student 5 (Java & DSA)
(6, 5, 1, TRUE, 600), 
(7, 5, 2, FALSE, 0),   
(8, 5, 26, TRUE, 800), 
(9, 5, 27, FALSE, 0),  
(10, 5, 28, FALSE, 100),

-- Student 6 (SQL & React)
(11, 6, 14, TRUE, 500), 
(12, 6, 15, FALSE, 0), 
(13, 6, 16, FALSE, 200), 
(14, 6, 46, TRUE, 700);

-- ============================================================
-- 6. QUESTION BANK & OPTIONS (V4 Compliance)
-- ============================================================
INSERT INTO question_bank (id, course_id, content, question_type) VALUES
(1, 1, 'Từ khóa nào ngăn không cho một class bị kế thừa?', 'SINGLE_CHOICE'),
(2, 5, 'Annotation nào được dùng để đánh dấu một REST API Controller trong Spring Boot?', 'SINGLE_CHOICE'),
(3, 8, 'Hook nào được dùng để thực hiện side-effects trong React?', 'SINGLE_CHOICE');

INSERT INTO question_options (question_id, content, is_correct, order_index) VALUES
(1, 'static', FALSE, 0), (1, 'final', TRUE, 1), (1, 'abstract', FALSE, 2), (1, 'private', FALSE, 3),
(2, '@Controller', FALSE, 0), (2, '@RestController', TRUE, 1), (2, '@Service', FALSE, 2),
(3, 'useState', FALSE, 0), (3, 'useEffect', TRUE, 1), (3, 'useContext', FALSE, 2);

-- ============================================================
-- 7. ASSESSMENTS & ATTEMPTS
-- ============================================================
INSERT INTO assessments (id, course_id, title, status, duration_minutes, max_attempts) VALUES
(1, 1, 'Quiz OOP Java', 'PUBLISHED', 30, 2),
(2, 5, 'Spring Boot Basic Test', 'PUBLISHED', 45, 1),
(3, 8, 'ReactJS Hooks Quiz', 'PUBLISHED', 20, 2);

INSERT INTO assessment_questions (assessment_id, question_id, order_index, points) VALUES
(1, 1, 0, 10.00), (2, 2, 0, 10.00), (3, 3, 0, 10.00);

INSERT INTO assessment_attempts (id, assessment_id, student_id, attempt_number, score, status) VALUES
(1, 1, 3, 1, 10.00, 'GRADED'),
(2, 1, 5, 1, 0.00, 'GRADED'),
(3, 2, 3, 1, NULL, 'IN_PROGRESS'),
(4, 3, 6, 1, 10.00, 'GRADED');

-- ============================================================
-- 8. RISK ASSESSMENTS
-- ============================================================
INSERT INTO risk_assessments (id, student_id, course_id, risk_score, risk_level) VALUES
(1, 5, 1, 65.00, 'HIGH'),
(2, 6, 2, 45.00, 'MEDIUM');

INSERT INTO risk_factors (id, risk_assessment_id, factor_type, factor_value, description) VALUES
(1, 1, 'LOW_SCORE', 0.00, 'Điểm bài Quiz OOP là 0.'),
(2, 1, 'INACTIVITY', 10.00, 'Đã 10 ngày không xem bài giảng Java.'),
(3, 2, 'LOW_PROGRESS', 25.00, 'Mới học 2 bài đầu tiên của SQL, chậm tiến độ 25%.');

-- ============================================================
-- 9. LEARNING MATERIALS
-- ============================================================
INSERT INTO learning_materials (id, lesson_id, title, file_url, file_type) VALUES
-- Course 1: Java Core
(1, 1, 'Video hướng dẫn cài đặt JDK', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(2, 2, 'Slide bài giảng: Kiểu dữ liệu trong Java', 'https://cdn.smartcampus.edu.vn/java/ch1-data-types.pdf', 'PDF'),
(3, 3, 'Video: Vòng lặp & Điều kiện', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(4, 4, 'Video: Khái niệm Class & Object', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(5, 5, 'Tài liệu đọc: Đóng gói & Kế thừa', 'https://cdn.smartcampus.edu.vn/java/ch2-encapsulation-inheritance.pdf', 'PDF'),
(6, 6, 'Slide phân tích: Đa hình (Polymorphism)', 'https://cdn.smartcampus.edu.vn/java/ch2-polymorphism.pdf', 'PDF'),
(7, 7, 'Video: Interface & Abstract Class', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(8, 8, 'Tài liệu tổng hợp: Java Collections Framework', 'https://cdn.smartcampus.edu.vn/java/ch3-collections-cheatsheet.pdf', 'PDF'),
(9, 9, 'Tài liệu hướng dẫn: Set & HashSet', 'https://cdn.smartcampus.edu.vn/java/ch3-set-hashset.doc', 'DOC'),
(10, 10, 'Video: Map & HashMap', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(11, 11, 'Sách tham khảo: Cơ bản về Multithreading', 'https://cdn.smartcampus.edu.vn/java/ch4-thread-concepts.pdf', 'PDF'),
(12, 12, 'Video: Triển khai Runnable Interface', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(13, 13, 'Mã nguồn mẫu: Đồng bộ hóa Thread', 'https://github.com/smartcampus/java-sync-demo.zip', 'ARCHIVE'),

-- Course 2: Cơ sở dữ liệu Quan Hệ (SQL)
(14, 14, 'Video: Thực thể và Khóa trong DB', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(15, 15, 'Tài liệu lý thuyết: Chuẩn hóa 1NF-3NF', 'https://cdn.smartcampus.edu.vn/sql/ch1-normalization.pdf', 'PDF'),
(16, 16, 'Bài tập thực hành: Thiết kế logic ERD', 'https://cdn.smartcampus.edu.vn/sql/ch1-erd-exercises.pdf', 'PDF'),
(17, 17, 'Video: Cấu trúc lệnh CREATE/ALTER', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(18, 19, 'Sổ tay: Các cú pháp SELECT thường dùng', 'https://cdn.smartcampus.edu.vn/sql/ch2-select-cheatsheet.pdf', 'PDF'),
(19, 20, 'Video: Trực quan hóa các loại JOIN', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(20, 22, 'Tài liệu chuyên sâu: Subqueries (Truy vấn con)', 'https://cdn.smartcampus.edu.vn/sql/ch3-subqueries.pdf', 'PDF'),
(21, 23, 'Video: Tạo và sử dụng Stored Procedures', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(22, 25, 'Slide kỹ thuật: Đánh Index và Tối ưu DB', 'https://cdn.smartcampus.edu.vn/sql/ch4-index-optimization.pdf', 'PDF'),

-- Course 3: Cấu trúc dữ liệu & Giải thuật
(23, 26, 'Video: Phân tích Mảng & Danh sách liên kết', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(24, 27, 'Tài liệu đọc: Cơ chế hoạt động của Stack', 'https://cdn.smartcampus.edu.vn/dsa/ch1-stack.pdf', 'PDF'),
(25, 29, 'Video: Cây nhị phân (Binary Tree)', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(26, 31, 'Giáo trình: Lý thuyết Đồ thị (Graph)', 'https://cdn.smartcampus.edu.vn/dsa/ch2-graph-theory.pdf', 'PDF'),
(27, 32, 'Video: Thuật toán Bubble & Insertion Sort', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(28, 33, 'Phân tích độ phức tạp: Merge Sort vs Quick Sort', 'https://cdn.smartcampus.edu.vn/dsa/ch3-sorting-complexity.pdf', 'PDF'),

-- Course 5: Spring Boot
(29, 35, 'Video: Vòng đời IoC Container', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(30, 36, 'Slide: Dependency Injection (DI) trong Spring', 'https://cdn.smartcampus.edu.vn/spring/ch1-dependency-injection.pdf', 'PDF'),
(31, 37, 'Video: Khởi tạo RESTful API', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(32, 38, 'Tài liệu: Cấu hình Global Exception Handling', 'https://cdn.smartcampus.edu.vn/spring/ch2-exception-handling.pdf', 'PDF'),
(33, 40, 'Mã nguồn: Cấu hình HikariCP & Datasource', 'https://github.com/smartcampus/spring-datasource-demo.zip', 'ARCHIVE'),
(34, 41, 'Slide: Ánh xạ Entity (Entity Mapping) bằng JPA', 'https://cdn.smartcampus.edu.vn/spring/ch3-entity-mapping.pdf', 'PDF'),
(35, 43, 'Tài liệu: Phân biệt Authentication & Authorization', 'https://cdn.smartcampus.edu.vn/spring/ch4-auth-concepts.pdf', 'PDF'),
(36, 44, 'Video: Triển khai luồng xác thực JWT', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),

-- Course 8: ReactJS
(37, 46, 'Video: Kiến trúc Virtual DOM', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(38, 47, 'Sổ tay: Phân rã Components & Truyền Props', 'https://cdn.smartcampus.edu.vn/react/ch1-components-props.pdf', 'PDF'),
(39, 49, 'Video: Kỹ thuật Conditional Rendering', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(40, 50, 'Video: Quản lý trạng thái với useState', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(41, 52, 'Bài viết: Tối ưu hiệu suất với useRef & useMemo', 'https://cdn.smartcampus.edu.vn/react/ch2-useref-usememo.doc', 'DOC'),
(42, 54, 'Tài liệu lý thuyết: Giới thiệu Redux Architecture', 'https://cdn.smartcampus.edu.vn/react/ch3-redux-intro.pdf', 'PDF'),
(43, 55, 'Video: Setup Redux Toolkit', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),

-- Course 9: AWS
(44, 56, 'Video: Khởi tạo & Cấu hình EC2', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(45, 57, 'Slide: Quản lý quyền và Policies trên S3', 'https://cdn.smartcampus.edu.vn/aws/ch1-s3-policies.pdf', 'PDF'),
(46, 58, 'Video: Triển khai Serverless với Lambda', 'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM', 'VIDEO'),
(47, 60, 'Tài liệu hướng dẫn: Backup & Restore RDS', 'https://cdn.smartcampus.edu.vn/aws/ch2-rds-backup.pdf', 'PDF');