INSERT INTO users (id, username, password_hash, full_name, email, role, status) VALUES
 (9901, 'assessment_lecturer', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Assessment Lecturer', 'assessment.lecturer@test.local', 'LECTURER', 'ACTIVE'),
 (9902, 'assessment_student', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Assessment Student', 'assessment.student@test.local', 'STUDENT', 'ACTIVE'),
 (9903, 'assessment_outsider', '$2b$10$f5AuQM95woINDr2mnGNR4.vcxxkjF7Oj/RDWyZ51FANIO02jjC0M2', 'Assessment Outsider', 'assessment.outsider@test.local', 'STUDENT', 'ACTIVE');

INSERT INTO courses (id, title, publication_state, is_enrollment_open, created_by) VALUES
 (9911, 'Assessment Course', 'PUBLISHED', TRUE, 9901),
 (9912, 'Other Course', 'PUBLISHED', TRUE, 9901);

INSERT INTO enrollments (student_id, course_id, status) VALUES (9902, 9911, 'ACTIVE');
