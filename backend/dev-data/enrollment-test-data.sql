-- 1. Reset previous test enrollments (history first because of the FK)
DELETE FROM enrollment_histories
WHERE enrollment_id IN (SELECT id FROM enrollments WHERE student_id IN (9001, 9002));

DELETE FROM enrollments
WHERE student_id IN (9001, 9002);

-- 2. Test users
INSERT INTO users (id, username, password_hash, full_name, email, role, status)
VALUES
    (9001, 'student_a',  '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student A',  'student.a@test.local',  'STUDENT',  'ACTIVE'),
    (9002, 'student_b',  '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Student B',  'student.b@test.local',  'STUDENT',  'INACTIVE'),
    (9003, 'lecturer_a', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Test Lecturer A', 'lecturer.a@test.local', 'LECTURER', 'ACTIVE')
    AS new_user
ON DUPLICATE KEY UPDATE
                     role   = new_user.role,
                     status = new_user.status;

-- 3. Test courses (one per business rule)
INSERT INTO courses (id, title, description, publication_state, is_enrollment_open, created_by)
VALUES
    (9101, '[TEST] Published + open',   'Student can enroll',           'PUBLISHED', TRUE,  9003),
    (9102, '[TEST] Draft',              'Not published -> 400',         'DRAFT',     TRUE,  9003),
    (9103, '[TEST] Enrollment closed',  'Window closed -> 400',         'PUBLISHED', FALSE, 9003),
    (9104, '[TEST] Archived',           'Not published -> 400',         'ARCHIVED',  TRUE,  9003)
    AS new_course
ON DUPLICATE KEY UPDATE
                     publication_state  = new_course.publication_state,
                     is_enrollment_open = new_course.is_enrollment_open;

INSERT IGNORE INTO course_lecturers (course_id, lecturer_id)
VALUES (9101, 9003), (9102, 9003), (9103, 9003), (9104, 9003);

-- 4. Check
SELECT id, username, role, status FROM users WHERE id BETWEEN 9001 AND 9003;
SELECT id, title, publication_state, is_enrollment_open FROM courses WHERE id BETWEEN 9101 AND 9104;
