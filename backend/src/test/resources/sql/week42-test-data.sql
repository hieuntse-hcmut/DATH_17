-- Test data for Week42IntegrationTest (copy of dev-data/week42-test-data.sql).
-- Runs inside the test transaction, which is rolled back after every test.

-- 1. Reset (children first because of the foreign keys)
DELETE FROM notifications        WHERE recipient_id BETWEEN 9001 AND 9006;
DELETE FROM learning_activities  WHERE student_id   BETWEEN 9001 AND 9006;
DELETE FROM learning_progress    WHERE student_id   BETWEEN 9001 AND 9006;
DELETE FROM enrollment_histories WHERE enrollment_id IN (SELECT id FROM enrollments WHERE course_id BETWEEN 9101 AND 9104);
DELETE FROM enrollments          WHERE course_id BETWEEN 9101 AND 9104;
DELETE FROM audit_logs           WHERE acting_user_id BETWEEN 9001 AND 9006;

-- 2. Users
INSERT INTO users (id, username, password_hash, full_name, email, role, status)
VALUES
    (9001, 'student_a',  '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student A',  'student.a@test.local',  'STUDENT',  'ACTIVE'),
    (9002, 'student_b',  '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student B',  'student.b@test.local',  'STUDENT',  'INACTIVE'),
    (9003, 'lecturer_a', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Lecturer A', 'lecturer.a@test.local', 'LECTURER', 'ACTIVE'),
    (9004, 'lecturer_b', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Lecturer B', 'lecturer.b@test.local', 'LECTURER', 'ACTIVE'),
    (9005, 'admin_a',    '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Admin A',    'admin.a@test.local',    'ADMIN',    'ACTIVE'),
    (9006, 'student_c',  '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student C',  'student.c@test.local',  'STUDENT',  'ACTIVE')
AS new_user
ON DUPLICATE KEY UPDATE
    password_hash = new_user.password_hash,
    role          = new_user.role,
    status        = new_user.status;

-- 3. Courses (lecturer_a created all of them; lecturer_b manages none)
INSERT INTO courses (id, title, description, publication_state, is_enrollment_open, created_by)
VALUES
    (9101, '[TEST] Published + open',  'Student can enroll',   'PUBLISHED', TRUE,  9003),
    (9102, '[TEST] Draft',             'Not published -> 400', 'DRAFT',     TRUE,  9003),
    (9103, '[TEST] Enrollment closed', 'Window closed -> 400', 'PUBLISHED', FALSE, 9003),
    (9104, '[TEST] Archived',          'Not published -> 400', 'ARCHIVED',  TRUE,  9003)
AS new_course
ON DUPLICATE KEY UPDATE
    publication_state  = new_course.publication_state,
    is_enrollment_open = new_course.is_enrollment_open,
    created_by         = new_course.created_by;

INSERT IGNORE INTO course_lecturers (course_id, lecturer_id)
VALUES (9101, 9003), (9102, 9003), (9103, 9003), (9104, 9003);

-- 4. Chapters and lessons of course 9101 (3 lessons) and 9103 (1 lesson)
INSERT INTO chapters (id, course_id, title, order_index)
VALUES (9201, 9101, '[TEST] Getting started', 0),
       (9202, 9101, '[TEST] REST APIs',       1),
       (9203, 9103, '[TEST] Closed course chapter', 0)
AS new_chapter
ON DUPLICATE KEY UPDATE title = new_chapter.title;

INSERT INTO lessons (id, chapter_id, title, content_type, order_index)
VALUES (9301, 9201, '[TEST] Spring Boot overview (video)', 'VIDEO', 0),
       (9302, 9201, '[TEST] Project structure (text)',     'TEXT',  1),
       (9303, 9202, '[TEST] Your first REST API (pdf)',    'PDF',   0),
       (9304, 9203, '[TEST] Lesson of the closed course',  'TEXT',  0)
AS new_lesson
ON DUPLICATE KEY UPDATE title = new_lesson.title;

