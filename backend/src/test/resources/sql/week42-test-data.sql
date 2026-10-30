
-- Test data for Week42IntegrationTest
-- Runs inside the test transaction, which is rolled back after every test.

-- 1. Reset (children first because of the foreign keys)
DELETE FROM notifications
WHERE recipient_id BETWEEN 9001 AND 9006;

DELETE FROM learning_activities
WHERE student_id BETWEEN 9001 AND 9006;

DELETE FROM learning_material_progress
WHERE student_id BETWEEN 9001 AND 9006;

DELETE FROM learning_progress
WHERE student_id BETWEEN 9001 AND 9006;

DELETE FROM enrollment_histories
WHERE enrollment_id IN (
    SELECT id FROM enrollments
    WHERE course_id BETWEEN 9101 AND 9104
);

DELETE FROM enrollments
WHERE course_id BETWEEN 9101 AND 9104;

DELETE FROM audit_logs
WHERE acting_user_id BETWEEN 9001 AND 9006;

-- 2. Users
INSERT INTO users (
    id, username, password_hash, full_name, email, role, status
)
VALUES
    (9001, 'student_a', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student A', 'student.a@test.local', 'STUDENT', 'ACTIVE'),
    (9002, 'student_b', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student B', 'student.b@test.local', 'STUDENT', 'INACTIVE'),
    (9003, 'lecturer_a', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Lecturer A', 'lecturer.a@test.local', 'LECTURER', 'ACTIVE'),
    (9004, 'lecturer_b', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Lecturer B', 'lecturer.b@test.local', 'LECTURER', 'ACTIVE'),
    (9005, 'admin_a', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Admin A', 'admin.a@test.local', 'ADMIN', 'ACTIVE'),
    (9006, 'student_c', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student C', 'student.c@test.local', 'STUDENT', 'ACTIVE')
    AS new_user
ON DUPLICATE KEY UPDATE
                     password_hash = new_user.password_hash,
                     role = new_user.role,
                     status = new_user.status;

-- 3. Courses
INSERT INTO courses (
    id, title, description, publication_state,
    is_enrollment_open, created_by
)
VALUES
    (9101, '[TEST] Published + open', 'Student can enroll', 'PUBLISHED', TRUE, 9003),
    (9102, '[TEST] Draft', 'Not published -> 400', 'DRAFT', TRUE, 9003),
    (9103, '[TEST] Enrollment closed', 'Window closed -> 400', 'PUBLISHED', FALSE, 9003),
    (9104, '[TEST] Archived', 'Not published -> 400', 'ARCHIVED', TRUE, 9003)
    AS new_course
ON DUPLICATE KEY UPDATE
                     publication_state = new_course.publication_state,
                     is_enrollment_open = new_course.is_enrollment_open,
                     created_by = new_course.created_by;

INSERT IGNORE INTO course_lecturers (course_id, lecturer_id)
VALUES
    (9101, 9003),
    (9102, 9003),
    (9103, 9003),
    (9104, 9003);

-- 4. Chapters
INSERT INTO chapters (id, course_id, title, order_index)
VALUES
    (9201, 9101, '[TEST] Getting started', 0),
    (9202, 9101, '[TEST] REST APIs', 1),
    (9203, 9103, '[TEST] Closed course chapter', 0)
    AS new_chapter
ON DUPLICATE KEY UPDATE
                     title = new_chapter.title;

-- 5. Lessons
-- content_type removed in V6
-- total_length removed in V7
INSERT INTO lessons (id, chapter_id, title, order_index)
VALUES
    (9301, 9201, '[TEST] Spring Boot overview (video)', 0),
    (9302, 9201, '[TEST] Project structure (text)', 1),
    (9303, 9202, '[TEST] Your first REST API (pdf)', 0),
    (9304, 9203, '[TEST] Lesson of the closed course', 0)
    AS new_lesson
ON DUPLICATE KEY UPDATE
                     title = new_lesson.title,
                     order_index = new_lesson.order_index;

INSERT INTO learning_materials (id, lesson_id, title, file_url, file_type, total_length)
VALUES
    (9401,9301,'[TEST] Spring Boot video','https://example.com/video.mp4','VIDEO',600),
    (9402,9302,'[TEST] Project structure','https://example.com/project-structure.pdf','PDF',NULL),
    (9403,9303,'[TEST] REST API document','https://example.com/rest-api.pdf','PDF',10),
    (9404,9304,'[TEST] Closed course document','https://example.com/closed-course.pdf','PDF',NULL)
    AS incoming
ON DUPLICATE KEY UPDATE
                     title=incoming.title, file_url=incoming.file_url,
                     file_type=incoming.file_type, total_length=incoming.total_length;