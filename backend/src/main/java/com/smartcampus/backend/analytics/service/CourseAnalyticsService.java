package com.smartcampus.backend.analytics.service;

import com.smartcampus.backend.analytics.dto.CourseAnalyticsResponse;
import com.smartcampus.backend.analytics.repository.CourseAnalyticsRepository;
import com.smartcampus.backend.analytics.repository.CourseEnrollmentStats;
import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.common.security.UserAccount;
import com.smartcampus.backend.progress.dto.ProgressStatus;
import com.smartcampus.backend.progress.repository.LearningProgressRepository;
import com.smartcampus.backend.progress.repository.projection.StudentProgressView;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smartcampus.backend.analytics.dto.CourseRiskSummaryResponse;
import com.smartcampus.backend.analytics.dto.StudentRiskResponse;

import java.util.List;

/**
 * Basic course analytics: enrollment counts and completion rate (FR-ANL-009).
 * Visible only to the course's lecturer and administrators (BR-ANL-006).
 */
@Service
public class CourseAnalyticsService {

    private final CourseAnalyticsRepository analyticsRepository;
    private final LearningProgressRepository progressRepository;
    private final CourseAccessGuard courseAccessGuard;

    public CourseAnalyticsService(CourseAnalyticsRepository analyticsRepository,
                                  LearningProgressRepository progressRepository,
                                  CourseAccessGuard courseAccessGuard) {
        this.analyticsRepository = analyticsRepository;
        this.progressRepository = progressRepository;
        this.courseAccessGuard = courseAccessGuard;
    }

    @Transactional(readOnly = true)
    public CourseAnalyticsResponse getCourseSummary(Long actorId, Long courseId) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);
        return summarize(courseId);
    }

    /** Summaries of every course the caller manages (admin: all courses). */
    @Transactional(readOnly = true)
    public List<CourseAnalyticsResponse> getMyCoursesSummary(Long actorId) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        if (!actor.isAdmin() && !actor.isLecturer()) {
            throw ApiException.forbidden("NOT_COURSE_STAFF", "Analytics are available to lecturers and administrators");
        }
        return courseAccessGuard.managedCourseIds(actor).stream()
                .map(this::summarize)
                .toList();
    }

    CourseAnalyticsResponse summarize(Long courseId) {
        CourseEnrollmentStats stats = analyticsRepository.findEnrollmentStats(courseId)
                .orElseThrow(() -> ApiException.notFound("COURSE_NOT_FOUND", "Course " + courseId + " does not exist"));
        long totalLessons = progressRepository.countLessonsOfCourse(courseId);
        List<StudentProgressView> students = progressRepository.findClassProgress(courseId);

        long completed = 0;
        long notStarted = 0;
        double percentSum = 0;
        for (StudentProgressView s : students) {
            long done = s.getCompletedLessons() == null ? 0 : s.getCompletedLessons();
            ProgressStatus status = ProgressStatus.of(done, totalLessons, s.getLastAccessedAt() != null);
            if (status == ProgressStatus.COMPLETED) {
                completed++;
            } else if (status == ProgressStatus.NOT_STARTED) {
                notStarted++;
            }
            percentSum += ProgressStatus.percent(done, totalLessons);
        }
        int active = students.size();
        long inProgress = active - completed - notStarted;

        return new CourseAnalyticsResponse(
                stats.courseId(), stats.courseTitle(), stats.publicationState(), stats.enrollmentOpen(),
                stats.activeEnrollments(), stats.withdrawnEnrollments(), stats.removedEnrollments(),
                stats.totalEnrollments(), stats.newEnrollmentsLast7Days(),
                totalLessons, completed, inProgress, notStarted,
                active == 0 ? 0.0 : round1(completed * 100.0 / active),
                active == 0 ? 0.0 : round1(percentSum / active));
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public CourseRiskSummaryResponse getCourseRiskSummary(Long actorId, Long courseId) {
        // Kiểm tra user hợp lệ và có quyền quản lý khóa học này không
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);

        // Gọi repository để lấy dữ liệu, nếu chưa có data thì trả về các giá trị 0
        return analyticsRepository.findRiskSummary(courseId)
                .orElse(new CourseRiskSummaryResponse(courseId, 0.0, 0, 0, 0));
    }

    @Transactional(readOnly = true)
    public List<StudentRiskResponse> getStudentRisks(Long actorId, Long courseId) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);

        return analyticsRepository.findStudentRisksByCourse(courseId);
    }
}
