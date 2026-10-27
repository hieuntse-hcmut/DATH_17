package com.smartcampus.backend.analytics.controller;

import com.smartcampus.backend.analytics.dto.CourseAnalyticsResponse;
import com.smartcampus.backend.analytics.service.CourseAnalyticsService;
import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.common.response.ApiResponse;
import com.smartcampus.backend.enrollment.security.CurrentUserResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.smartcampus.backend.analytics.dto.CourseRiskSummaryResponse;
import com.smartcampus.backend.analytics.dto.StudentRiskResponse;

import java.util.List;

@Tag(name = "Analytics", description = "Course statistics for lecturers and administrators")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@RestController
public class CourseAnalyticsController {

    private final CourseAnalyticsService analyticsService;
    private final CurrentUserResolver currentUserResolver;

    public CourseAnalyticsController(CourseAnalyticsService analyticsService, CurrentUserResolver currentUserResolver) {
        this.analyticsService = analyticsService;
        this.currentUserResolver = currentUserResolver;
    }

    @Operation(summary = "Statistics of one course",
            description = """
                    Enrollment counts (active, withdrawn, removed, total, new in 7 days) and completion
                    (students completed / in progress / not started, completion rate, average progress).
                    Only the course's lecturer or an administrator (BR-ANL-006).

                    Errors: 404 COURSE_NOT_FOUND, 403 NOT_COURSE_STAFF.
                    """)
    @GetMapping("/api/analytics/courses/{courseId}/summary")
    public ApiResponse<CourseAnalyticsResponse> getCourseSummary(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId) {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(analyticsService.getCourseSummary(actorId, courseId));
    }

    @Operation(summary = "Statistics of every course I manage",
            description = "Lecturer: courses he created or is assigned to. Admin: every course. Student: 403 NOT_COURSE_STAFF.")
    @GetMapping("/api/analytics/courses")
    public ApiResponse<List<CourseAnalyticsResponse>> getMyCoursesSummary() {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(analyticsService.getMyCoursesSummary(actorId));
    }

    @Operation(summary = "Statistics of risk scores for a course",
            description = "Trả về điểm rủi ro trung bình và số lượng sinh viên theo từng cấp độ rủi ro (HIGH, MEDIUM, LOW).")
    @GetMapping("/api/analytics/courses/{courseId}/risk-summary")
    public ApiResponse<CourseRiskSummaryResponse> getCourseRiskSummary(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId) {

        // Lấy ID của người dùng đang đăng nhập từ JWT
        Long actorId = currentUserResolver.getCurrentUserId();

        // Gọi service và bọc kết quả vào ApiResponse.ok()
        return ApiResponse.ok(analyticsService.getCourseRiskSummary(actorId, courseId));
    }

    @Operation(summary = "List risk scores of individual students in a course",
            description = "Trả về danh sách chi tiết điểm rủi ro của từng sinh viên đang học trong lớp. Chỉ giảng viên quản lý lớp hoặc Admin mới xem được.")
    @GetMapping("/api/analytics/courses/{courseId}/students/risk")
    public ApiResponse<List<StudentRiskResponse>> getStudentRisks(
            @Parameter(example = "9101", required = true) @PathVariable("courseId") Long courseId) {
        Long actorId = currentUserResolver.getCurrentUserId();
        return ApiResponse.ok(analyticsService.getStudentRisks(actorId, courseId));
    }
}
