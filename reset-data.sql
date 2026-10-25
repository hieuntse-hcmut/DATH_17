-- ==============================================================================
-- SCRIPT RESET TIẾN ĐỘ HỌC TẬP DATH_17 (TESTING ONLY)
-- ==============================================================================

-- 1. Reset trạng thái xem Video và Bài học
-- Đưa tất cả các bài học về trạng thái chưa hoàn thành và vị trí xem video về 0 giây
UPDATE learning_progress 
SET is_completed = FALSE,
    last_position = 0;

-- Xóa toàn bộ nhật ký sự kiện học tập (VIDEO_PLAY, VIDEO_PAUSE, VIDEO_END,...)
DELETE FROM learning_activities;

-- 2. Đảm bảo trạng thái đăng ký khóa học đang ở mức "Đang học"
-- Chuyển trạng thái về ACTIVE cho những sinh viên không bị rút khỏi môn học (WITHDRAWN) hoặc bị xóa (REMOVED)
UPDATE enrollments 
SET status = 'ACTIVE' 
WHERE status NOT IN ('WITHDRAWN', 'REMOVED');

-- 3. Reset lịch sử làm bài kiểm tra/Assessment (Tùy chọn nhưng cần thiết nếu muốn học lại từ đầu)
-- Xóa toàn bộ kết quả chi tiết từng câu hỏi
DELETE FROM attempt_answers;
-- Xóa các lượt đã làm bài của sinh viên
DELETE FROM assessment_attempts;

-- docker exec -i smart-campus-mysql mysql -u smartcampus -psmartcampus smart_campus < reset-data.sql