-- V2__enrollment_status_withdrawn_removed.sql
-- Owner: Enrollment module
--
-- Aligns the enrollment status vocabulary with docs/01-requirements/03-enrollment.md §3.1:
--   ACTIVE    current participation
--   WITHDRAWN the Student ended participation
--   REMOVED   an assigned Lecturer or an Administrator ended participation
-- Course completion belongs to Learning Progress, so COMPLETED is no longer an enrollment status.
--

ALTER TABLE enrollments DROP CHECK chk_enrollments_status;
ALTER TABLE enrollment_histories DROP CHECK chk_enrollment_histories_previous_status;
ALTER TABLE enrollment_histories DROP CHECK chk_enrollment_histories_new_status;

UPDATE enrollments SET status = 'WITHDRAWN' WHERE status = 'DROPPED';
UPDATE enrollments SET status = 'ACTIVE'    WHERE status = 'COMPLETED';

UPDATE enrollment_histories SET previous_status = 'WITHDRAWN' WHERE previous_status = 'DROPPED';
UPDATE enrollment_histories SET previous_status = 'ACTIVE'    WHERE previous_status = 'COMPLETED';
UPDATE enrollment_histories SET new_status      = 'WITHDRAWN' WHERE new_status = 'DROPPED';
UPDATE enrollment_histories SET new_status      = 'ACTIVE'    WHERE new_status = 'COMPLETED';

ALTER TABLE enrollments
    ADD CONSTRAINT chk_enrollments_status
        CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'REMOVED'));

ALTER TABLE enrollment_histories
    ADD CONSTRAINT chk_enrollment_histories_previous_status
        CHECK (previous_status IS NULL OR previous_status IN ('ACTIVE', 'WITHDRAWN', 'REMOVED'));

ALTER TABLE enrollment_histories
    ADD CONSTRAINT chk_enrollment_histories_new_status
        CHECK (new_status IN ('ACTIVE', 'WITHDRAWN', 'REMOVED'));

-- Roster and analytics read enrollments by course and status.
CREATE INDEX idx_enrollments_course_status ON enrollments (course_id, status);
