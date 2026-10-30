-- V8__learning_material_progress.sql
-- Owner: Learning Content + Learning Progress
--
-- Move progress tracking from Lesson to LearningMaterial.
-- A Lesson is completed when all its materials are completed.

-- =====================================================
-- 1. Add total_length to learning_materials
-- =====================================================

ALTER TABLE learning_materials
    ADD COLUMN total_length INT NULL;

ALTER TABLE learning_materials
    ADD CONSTRAINT chk_learning_materials_total_length
        CHECK (total_length IS NULL OR total_length > 0);


-- =====================================================
-- 2. Create learning_material_progress
-- =====================================================

CREATE TABLE learning_material_progress (
                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                            student_id BIGINT NOT NULL,
                                            material_id BIGINT NOT NULL,

                                            is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                                            last_position INT NOT NULL DEFAULT 0,

                                            updated_at TIMESTAMP NOT NULL
                                                                          DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,

                                            CONSTRAINT uk_material_progress_student_material
                                                UNIQUE (student_id, material_id),

                                            CONSTRAINT chk_material_progress_last_position
                                                CHECK (last_position >= 0),

                                            CONSTRAINT fk_material_progress_student
                                                FOREIGN KEY (student_id)
                                                    REFERENCES users(id)
                                                    ON DELETE RESTRICT
                                                    ON UPDATE RESTRICT,

                                            CONSTRAINT fk_material_progress_material
                                                FOREIGN KEY (material_id)
                                                    REFERENCES learning_materials(id)
                                                    ON DELETE RESTRICT
                                                    ON UPDATE RESTRICT,

                                            INDEX idx_material_progress_material (material_id)
);


-- =====================================================
-- 3. Add material_id to learning_activities
-- =====================================================

ALTER TABLE learning_activities
    ADD COLUMN material_id BIGINT NULL;

ALTER TABLE learning_activities
    ADD CONSTRAINT fk_learning_activities_material
        FOREIGN KEY (material_id)
            REFERENCES learning_materials(id)
            ON DELETE RESTRICT
            ON UPDATE RESTRICT;

CREATE INDEX idx_learning_activities_material_created
    ON learning_activities (material_id, created_at);