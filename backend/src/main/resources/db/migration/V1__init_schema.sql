-- V1__init_schema.sql
-- Smart Campus LMS - Initial database baseline
-- Target: MySQL 8.4 + Flyway
--
-- Baseline conventions:
-- - BIGINT AUTO_INCREMENT for standalone primary keys.
-- - VARCHAR for application enums; Java maps them with EnumType.STRING.
-- - DECIMAL for scores/points/risk values.
-- - Database-managed timestamps.
-- - Important business uniqueness is enforced in the database.
-- - RESTRICT is preferred for historical/aggregate relationships.
-- - CASCADE is used only for strongly-owned child records/join records.

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(100) NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(150) NOT NULL,
                       email VARCHAR(255) NOT NULL,
                       role VARCHAR(30) NOT NULL,
                       status VARCHAR(30) NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                       CONSTRAINT uk_users_username UNIQUE (username),
                       CONSTRAINT uk_users_email UNIQUE (email),
                       CONSTRAINT chk_users_role CHECK (role IN ('STUDENT', 'LECTURER', 'ADMIN')),
                       CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE courses (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         title VARCHAR(255) NOT NULL,
                         description TEXT NULL,
                         publication_state VARCHAR(30) NOT NULL,
                         is_enrollment_open BOOLEAN NOT NULL DEFAULT FALSE,
                         created_by BIGINT NOT NULL,
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                         CONSTRAINT chk_courses_publication_state
                             CHECK (publication_state IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
                         CONSTRAINT fk_courses_created_by
                             FOREIGN KEY (created_by) REFERENCES users(id)
                                 ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE course_lecturers (
                                  course_id BIGINT NOT NULL,
                                  lecturer_id BIGINT NOT NULL,

                                  PRIMARY KEY (course_id, lecturer_id),

                                  CONSTRAINT fk_course_lecturers_course
                                      FOREIGN KEY (course_id) REFERENCES courses(id)
                                          ON DELETE CASCADE ON UPDATE RESTRICT,
                                  CONSTRAINT fk_course_lecturers_lecturer
                                      FOREIGN KEY (lecturer_id) REFERENCES users(id)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE audit_logs (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            acting_user_id BIGINT NOT NULL,
                            target_user_id BIGINT NULL,
                            action VARCHAR(100) NOT NULL,
                            reason TEXT NULL,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT fk_audit_logs_acting_user
                                FOREIGN KEY (acting_user_id) REFERENCES users(id)
                                    ON DELETE RESTRICT ON UPDATE RESTRICT,
                            CONSTRAINT fk_audit_logs_target_user
                                FOREIGN KEY (target_user_id) REFERENCES users(id)
                                    ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE chapters (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          course_id BIGINT NOT NULL,
                          title VARCHAR(255) NOT NULL,
                          order_index INT NOT NULL,

                          CONSTRAINT uk_chapters_course_order UNIQUE (course_id, order_index),
                          CONSTRAINT chk_chapters_order_index CHECK (order_index >= 0),
                          CONSTRAINT fk_chapters_course
                              FOREIGN KEY (course_id) REFERENCES courses(id)
                                  ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE enrollments (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             student_id BIGINT NOT NULL,
                             course_id BIGINT NOT NULL,
                             status VARCHAR(30) NOT NULL,
                             enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                             CONSTRAINT uk_enrollments_student_course UNIQUE (student_id, course_id),
                             CONSTRAINT chk_enrollments_status
                                 CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
                             CONSTRAINT fk_enrollments_student
                                 FOREIGN KEY (student_id) REFERENCES users(id)
                                     ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_enrollments_course
                                 FOREIGN KEY (course_id) REFERENCES courses(id)
                                     ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE enrollment_histories (
                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      enrollment_id BIGINT NOT NULL,
                                      previous_status VARCHAR(30) NULL,
                                      new_status VARCHAR(30) NOT NULL,
                                      changed_by BIGINT NOT NULL,
                                      reason TEXT NULL,
                                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                      CONSTRAINT chk_enrollment_histories_previous_status
                                          CHECK (previous_status IS NULL OR previous_status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
                                      CONSTRAINT chk_enrollment_histories_new_status
                                          CHECK (new_status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
                                      CONSTRAINT fk_enrollment_histories_enrollment
                                          FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
                                              ON DELETE RESTRICT ON UPDATE RESTRICT,
                                      CONSTRAINT fk_enrollment_histories_changed_by
                                          FOREIGN KEY (changed_by) REFERENCES users(id)
                                              ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE lessons (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         chapter_id BIGINT NOT NULL,
                         title VARCHAR(255) NOT NULL,
                         content_type VARCHAR(50) NOT NULL,
                         order_index INT NOT NULL,

                         CONSTRAINT uk_lessons_chapter_order UNIQUE (chapter_id, order_index),
                         CONSTRAINT chk_lessons_order_index CHECK (order_index >= 0),
                         CONSTRAINT fk_lessons_chapter
                             FOREIGN KEY (chapter_id) REFERENCES chapters(id)
                                 ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE learning_materials (
                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    lesson_id BIGINT NOT NULL,
                                    title VARCHAR(255) NOT NULL,
                                    file_url TEXT NOT NULL,
                                    file_type VARCHAR(50) NOT NULL,

                                    CONSTRAINT fk_learning_materials_lesson
                                        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
                                            ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE learning_progress (
                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   student_id BIGINT NOT NULL,
                                   lesson_id BIGINT NOT NULL,
                                   is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                                   last_position INT NOT NULL DEFAULT 0,
                                   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                                   CONSTRAINT uk_learning_progress_student_lesson UNIQUE (student_id, lesson_id),
                                   CONSTRAINT chk_learning_progress_last_position CHECK (last_position >= 0),
                                   CONSTRAINT fk_learning_progress_student
                                       FOREIGN KEY (student_id) REFERENCES users(id)
                                           ON DELETE RESTRICT ON UPDATE RESTRICT,
                                   CONSTRAINT fk_learning_progress_lesson
                                       FOREIGN KEY (lesson_id) REFERENCES lessons(id)
                                           ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE learning_activities (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     student_id BIGINT NOT NULL,
                                     lesson_id BIGINT NULL,
                                     event_type VARCHAR(50) NOT NULL,
                                     current_position INT NULL,
                                     total_length INT NULL,
                                     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                     CONSTRAINT chk_learning_activities_current_position
                                         CHECK (current_position IS NULL OR current_position >= 0),
                                     CONSTRAINT chk_learning_activities_total_length
                                         CHECK (total_length IS NULL OR total_length >= 0),
                                     CONSTRAINT fk_learning_activities_student
                                         FOREIGN KEY (student_id) REFERENCES users(id)
                                             ON DELETE RESTRICT ON UPDATE RESTRICT,
                                     CONSTRAINT fk_learning_activities_lesson
                                         FOREIGN KEY (lesson_id) REFERENCES lessons(id)
                                             ON DELETE RESTRICT ON UPDATE RESTRICT,

                                     INDEX idx_learning_activities_student_created (student_id, created_at),
                                     INDEX idx_learning_activities_lesson_created (lesson_id, created_at)
);

CREATE TABLE question_bank (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               course_id BIGINT NOT NULL,
                               content TEXT NOT NULL,
                               question_type VARCHAR(50) NOT NULL,
                               answer_data JSON NULL,

                               CONSTRAINT chk_question_bank_type
                                   CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER')),
                               CONSTRAINT fk_question_bank_course
                                   FOREIGN KEY (course_id) REFERENCES courses(id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE assessments (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             course_id BIGINT NOT NULL,
                             title VARCHAR(255) NOT NULL,
                             status VARCHAR(30) NOT NULL,
                             start_time TIMESTAMP NULL,
                             end_time TIMESTAMP NULL,
                             duration_minutes INT NULL,
                             max_attempts INT NOT NULL,

                             CONSTRAINT chk_assessments_status
                                 CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
                             CONSTRAINT chk_assessments_duration
                                 CHECK (duration_minutes IS NULL OR duration_minutes > 0),
                             CONSTRAINT chk_assessments_max_attempts CHECK (max_attempts > 0),
                             CONSTRAINT chk_assessments_time
                                 CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time),
                             CONSTRAINT fk_assessments_course
                                 FOREIGN KEY (course_id) REFERENCES courses(id)
                                     ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE assessment_questions (
                                      assessment_id BIGINT NOT NULL,
                                      question_id BIGINT NOT NULL,
                                      order_index INT NOT NULL,
                                      points DECIMAL(8,2) NOT NULL,

                                      PRIMARY KEY (assessment_id, question_id),
                                      CONSTRAINT uk_assessment_questions_order UNIQUE (assessment_id, order_index),
                                      CONSTRAINT chk_assessment_questions_order_index CHECK (order_index >= 0),
                                      CONSTRAINT chk_assessment_questions_points CHECK (points >= 0),
                                      CONSTRAINT fk_assessment_questions_assessment
                                          FOREIGN KEY (assessment_id) REFERENCES assessments(id)
                                              ON DELETE CASCADE ON UPDATE RESTRICT,
                                      CONSTRAINT fk_assessment_questions_question
                                          FOREIGN KEY (question_id) REFERENCES question_bank(id)
                                              ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE assessment_attempts (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     assessment_id BIGINT NOT NULL,
                                     student_id BIGINT NOT NULL,
                                     attempt_number INT NOT NULL,
                                     start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     submit_time TIMESTAMP NULL,
                                     score DECIMAL(8,2) NULL,
                                     status VARCHAR(30) NOT NULL,

                                     CONSTRAINT uk_assessment_attempts_number
                                         UNIQUE (assessment_id, student_id, attempt_number),
                                     CONSTRAINT chk_assessment_attempts_number CHECK (attempt_number > 0),
                                     CONSTRAINT chk_assessment_attempts_score CHECK (score IS NULL OR score >= 0),
                                     CONSTRAINT chk_assessment_attempts_status
                                         CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED')),
                                     CONSTRAINT chk_assessment_attempts_time
                                         CHECK (submit_time IS NULL OR submit_time >= start_time),
                                     CONSTRAINT fk_assessment_attempts_assessment
                                         FOREIGN KEY (assessment_id) REFERENCES assessments(id)
                                             ON DELETE RESTRICT ON UPDATE RESTRICT,
                                     CONSTRAINT fk_assessment_attempts_student
                                         FOREIGN KEY (student_id) REFERENCES users(id)
                                             ON DELETE RESTRICT ON UPDATE RESTRICT,

                                     INDEX idx_assessment_attempts_student (student_id)
);

CREATE TABLE attempt_answers (
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 attempt_id BIGINT NOT NULL,
                                 question_id BIGINT NOT NULL,
                                 answer_data JSON NULL,
                                 is_correct BOOLEAN NULL,
                                 score DECIMAL(8,2) NULL,
                                 feedback TEXT NULL,

                                 CONSTRAINT uk_attempt_answers_attempt_question UNIQUE (attempt_id, question_id),
                                 CONSTRAINT chk_attempt_answers_score CHECK (score IS NULL OR score >= 0),
                                 CONSTRAINT fk_attempt_answers_attempt
                                     FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id)
                                         ON DELETE CASCADE ON UPDATE RESTRICT,
                                 CONSTRAINT fk_attempt_answers_question
                                     FOREIGN KEY (question_id) REFERENCES question_bank(id)
                                         ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE risk_assessments (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  student_id BIGINT NOT NULL,
                                  course_id BIGINT NOT NULL,
                                  risk_score DECIMAL(5,2) NOT NULL,
                                  risk_level VARCHAR(20) NOT NULL,
                                  assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT chk_risk_assessments_score
                                      CHECK (risk_score >= 0 AND risk_score <= 100),
                                  CONSTRAINT chk_risk_assessments_level
                                      CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
                                  CONSTRAINT fk_risk_assessments_student
                                      FOREIGN KEY (student_id) REFERENCES users(id)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT,
                                  CONSTRAINT fk_risk_assessments_course
                                      FOREIGN KEY (course_id) REFERENCES courses(id)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT,

                                  INDEX idx_risk_assessments_student_course_assessed
                                      (student_id, course_id, assessed_at),
                                  INDEX idx_risk_assessments_course_level
                                      (course_id, risk_level)
);

CREATE TABLE risk_factors (
                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              risk_assessment_id BIGINT NOT NULL,
                              factor_type VARCHAR(50) NOT NULL,
                              factor_value DECIMAL(8,2) NULL,
                              description TEXT NULL,

                              CONSTRAINT fk_risk_factors_risk_assessment
                                  FOREIGN KEY (risk_assessment_id) REFERENCES risk_assessments(id)
                                      ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE interventions (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               risk_assessment_id BIGINT NOT NULL,
                               created_by BIGINT NOT NULL,
                               intervention_type VARCHAR(50) NOT NULL,
                               description TEXT NOT NULL,
                               status VARCHAR(30) NOT NULL,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               completed_at TIMESTAMP NULL,

                               CONSTRAINT chk_interventions_status
                                   CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
                               CONSTRAINT chk_interventions_completed_at
                                   CHECK (completed_at IS NULL OR completed_at >= created_at),
                               CONSTRAINT fk_interventions_risk_assessment
                                   FOREIGN KEY (risk_assessment_id) REFERENCES risk_assessments(id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT,
                               CONSTRAINT fk_interventions_created_by
                                   FOREIGN KEY (created_by) REFERENCES users(id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT
);
