-- V5__lesson_total_length.sql
-- Owner: Learning Content + Learning Progress
--
-- Độ dài của một bài học, do lecturer nhập, để server tự tính phần trăm hoàn thành
-- thay vì tin totalLength client gửi lên (BR-PROG-001, BR-PROG-003):
--   VIDEO : tổng số giây
--   PDF   : tổng số trang
--   TEXT  : NULL (hoàn thành bằng "Mark as done")
-- NULL cũng nghĩa là lecturer chưa nhập: tiến độ vẫn được lưu nhưng bài không tự hoàn thành.
-- Chốt luôn open decision #1 trong docs/02-design/database-conventions.md (đơn vị của
-- last_position / current_position / total_length).

ALTER TABLE lessons
    ADD COLUMN total_length INT NULL;

ALTER TABLE lessons
    ADD CONSTRAINT chk_lessons_total_length
        CHECK (total_length IS NULL OR total_length > 0);
