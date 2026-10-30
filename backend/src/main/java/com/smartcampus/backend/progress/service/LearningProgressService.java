package com.smartcampus.backend.progress.service;

import com.smartcampus.backend.common.exception.ApiException;
import com.smartcampus.backend.common.security.CourseAccessGuard;
import com.smartcampus.backend.common.security.UserAccount;
import com.smartcampus.backend.notification.entity.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import com.smartcampus.backend.progress.dto.CourseProgressResponse;
import com.smartcampus.backend.progress.dto.LessonProgressItem;
import com.smartcampus.backend.progress.dto.LessonProgressResponse;
import com.smartcampus.backend.progress.dto.MyCourseProgressResponse;
import com.smartcampus.backend.progress.dto.ProgressStatus;
import com.smartcampus.backend.progress.dto.StudentProgressResponse;
import com.smartcampus.backend.progress.dto.UpdatePositionRequest;
import com.smartcampus.backend.progress.entity.LearningActivity;
import com.smartcampus.backend.progress.entity.LearningEventType;
import com.smartcampus.backend.progress.entity.LearningProgress;
import com.smartcampus.backend.progress.repository.LearningActivityRepository;
import com.smartcampus.backend.progress.repository.LearningProgressRepository;
import com.smartcampus.backend.progress.repository.projection.LessonContextView;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Learning Progress (docs/01-requirements/04-learning-progress.md):
 * mark a lesson complete, save the resume position, course progress, "My Courses",
 * lecturer class view, and LearningActivity events for Learning Analytics.
 */
@Service
public class LearningProgressService {

    /** BR-PROG-001: a lesson is complete at 90% of its length. */
    static final int COMPLETION_THRESHOLD_PERCENT = 90;

    /**
     * FR-PROG-001: manual "Mark as done" is only for content without pages/duration.
     * VIDEO and PDF are completed through PUT /api/lessons/{id}/progress (90% threshold).
     * Nếu FE chưa làm theo dõi số trang PDF, có thể tạm thêm "PDF" vào đây.
     */
    static final Set<String> MANUAL_COMPLETION_TYPES = Set.of("TEXT");

    private final LearningProgressRepository progressRepository;
    private final LearningActivityRepository activityRepository;
    private final CourseAccessGuard courseAccessGuard;
    private final NotificationService notificationService;

    public LearningProgressService(LearningProgressRepository progressRepository,
                                   LearningActivityRepository activityRepository,
                                   CourseAccessGuard courseAccessGuard,
                                   NotificationService notificationService) {
        this.progressRepository = progressRepository;
        this.activityRepository = activityRepository;
        this.courseAccessGuard = courseAccessGuard;
        this.notificationService = notificationService;
    }

    /** FR-PROG-001: manual "Mark as done" (idempotent), only for TEXT lessons. */
    @Transactional
    public LessonProgressResponse markLessonComplete(Long studentId, Long lessonId) {
        LessonContextView lesson = requireLessonAccess(studentId, lessonId);
        requireManualCompletionAllowed(lesson);
        boolean wasCompleted = isCompleted(studentId, lessonId);

        progressRepository.upsertCompleted(studentId, lessonId);
        if (!wasCompleted) {
            onLessonCompleted(studentId, lesson, null, null);
        }
        return lessonResponse(studentId, lesson);
    }

    /**
     * FR-PROG-002 + BR-PROG-001: save the resume position; the lesson becomes complete
     * automatically once position >= 90% of its total_length.
     * The length comes from the lesson (V5), never from the client: request.totalLength() is ignored,
     * so a client cannot complete a lesson by sending {"position":1,"totalLength":1}.
     * A lesson without total_length only saves the position.
     */
    @Transactional
    public LessonProgressResponse updatePosition(Long studentId, Long lessonId, UpdatePositionRequest request) {
        LessonContextView lesson = requireLessonAccess(studentId, lessonId);
        Integer total = lesson.getTotalLength();
        int position = total == null ? request.position() : Math.min(request.position(), total);
        boolean reachesThreshold = reachesThreshold(position, total);
        boolean wasCompleted = isCompleted(studentId, lessonId);

        progressRepository.upsertPosition(studentId, lessonId, position, reachesThreshold);

        // BR-PROG-004: at most one LESSON_PROGRESS event per lesson every 15 seconds
        if (activityRepository.countRecentEvents(studentId, lessonId, LearningEventType.LESSON_PROGRESS.name()) == 0) {
            activityRepository.save(new LearningActivity(studentId, lessonId,
                    LearningEventType.LESSON_PROGRESS, position, total));
        }
        if (reachesThreshold && !wasCompleted) {
            onLessonCompleted(studentId, lesson, position, total);
        }
        return lessonResponse(studentId, lesson);
    }

    /** FR-PROG-003 + UC-PROG-001: lessons of one course with progress and the resume point. */
    @Transactional(readOnly = true)
    public CourseProgressResponse getMyCourseProgress(Long studentId, Long courseId) {
        String courseTitle = progressRepository.findCourseTitle(courseId)
                .orElseThrow(() -> courseNotFound(courseId));
        if (progressRepository.countActiveEnrollment(studentId, courseId) == 0) {
            throw ApiException.forbidden("NOT_ENROLLED", "You have no ACTIVE enrollment in course " + courseId);
        }
        return buildCourseProgress(studentId, courseId, courseTitle);
    }

    /** FR-PROG-006: one student's lesson-by-lesson progress, for the course's lecturer/admin. */
    @Transactional(readOnly = true)
    public CourseProgressResponse getStudentCourseProgress(Long actorId, Long courseId, Long studentId) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);
        String courseTitle = progressRepository.findCourseTitle(courseId).orElseThrow(() -> courseNotFound(courseId));
        if (progressRepository.countActiveEnrollment(studentId, courseId) == 0) {
            throw ApiException.notFound("NOT_ENROLLED",
                    "Student " + studentId + " has no ACTIVE enrollment in course " + courseId);
        }
        return buildCourseProgress(studentId, courseId, courseTitle);
    }

    /** FR-PROG-004: every ACTIVE course of the student, most recently accessed first. */
    @Transactional(readOnly = true)
    public List<MyCourseProgressResponse> getMyCourses(Long studentId) {
        return progressRepository.findMyCourseProgress(studentId).stream()
                .map(MyCourseProgressResponse::of)
                .toList();
    }

    /** FR-PROG-006: progress of the whole class (assigned lecturer or admin). */
    @Transactional(readOnly = true)
    public List<StudentProgressResponse> getClassProgress(Long actorId, Long courseId) {
        UserAccount actor = courseAccessGuard.requireUser(actorId);
        courseAccessGuard.requireCourseManager(actor, courseId);
        long totalLessons = progressRepository.countLessonsOfCourse(courseId);
        return progressRepository.findClassProgress(courseId).stream()
                .map(v -> StudentProgressResponse.of(v, totalLessons))
                .toList();
    }

    // ------------------------------------------------------------------ helpers

    /**
     * BR-ENROLL-003: a student works on a lesson only with an ACTIVE enrollment
     * in a PUBLISHED course. Lecturers and admins have read-only access (FR-PROG-006).
     */
    private LessonContextView requireLessonAccess(Long studentId, Long lessonId) {
        UserAccount user = courseAccessGuard.requireUser(studentId);
        if (!user.isStudent()) {
            throw ApiException.forbidden("NOT_A_STUDENT", "Only students record learning progress");
        }
        LessonContextView lesson = progressRepository.findLessonContext(lessonId)
                .orElseThrow(() -> ApiException.notFound("LESSON_NOT_FOUND", "Lesson " + lessonId + " does not exist"));
        if (progressRepository.countActiveEnrollment(studentId, lesson.getCourseId()) == 0) {
            throw ApiException.forbidden("NOT_ENROLLED",
                    "You have no ACTIVE enrollment in course " + lesson.getCourseId());
        }
        if (!"PUBLISHED".equals(lesson.getPublicationState())) {
            throw ApiException.forbidden("COURSE_NOT_PUBLISHED",
                    "Course " + lesson.getCourseId() + " is not published");
        }
        return lesson;
    }

    /** VIDEO/PDF must reach the 90% threshold through PUT /progress instead of a manual click. */
    private static void requireManualCompletionAllowed(LessonContextView lesson) {
        // String type = lesson.getContentType() == null ? "" : lesson.getContentType().toUpperCase(Locale.ROOT);
        // if (!MANUAL_COMPLETION_TYPES.contains(type)) {
        //     throw ApiException.badRequest("MANUAL_COMPLETION_NOT_ALLOWED",
        //             "Lesson " + lesson.getLessonId() + " (" + lesson.getContentType()
        //                     + ") is completed through PUT /api/lessons/" + lesson.getLessonId() + "/progress");
        // }
    }

    private boolean isCompleted(Long studentId, Long lessonId) {
        return progressRepository.findByStudentIdAndLessonId(studentId, lessonId)
                .map(LearningProgress::isCompleted)
                .orElse(false);
    }

    static boolean reachesThreshold(int position, Integer totalLength) {
        return totalLength != null && totalLength > 0
                && position * 100L >= (long) totalLength * COMPLETION_THRESHOLD_PERCENT;
    }

    private void onLessonCompleted(Long studentId, LessonContextView lesson, Integer position, Integer total) {
        activityRepository.save(new LearningActivity(studentId, lesson.getLessonId(),
                LearningEventType.LESSON_COMPLETED, position, total));

        long totalLessons = progressRepository.countLessonsOfCourse(lesson.getCourseId());
        long completed = progressRepository.countCompletedLessons(studentId, lesson.getCourseId());
        if (totalLessons > 0 && completed >= totalLessons) {
            notificationService.notify(studentId, NotificationType.COURSE_COMPLETED,
                    "Course completed",
                    "Congratulations! You completed every lesson of \"" + lesson.getCourseTitle() + "\".",
                    "/courses/" + lesson.getCourseId());
        }
    }

    private LessonProgressResponse lessonResponse(Long studentId, LessonContextView lesson) {
        LearningProgress progress = progressRepository.findByStudentIdAndLessonId(studentId, lesson.getLessonId())
                .orElseThrow();
        long total = progressRepository.countLessonsOfCourse(lesson.getCourseId());
        long done = progressRepository.countCompletedLessons(studentId, lesson.getCourseId());
        return new LessonProgressResponse(lesson.getLessonId(), lesson.getCourseId(), progress.isCompleted(),
                progress.getLastPosition(), done, total, ProgressStatus.percent(done, total));
    }

    private CourseProgressResponse buildCourseProgress(Long studentId, Long courseId, String courseTitle) {
        List<LessonProgressItem> lessons = progressRepository.findLessonsWithProgress(studentId, courseId)
                .stream()
                .map(LessonProgressItem::of)
                .toList();
        long total = lessons.size();
        long done = lessons.stream().filter(LessonProgressItem::completed).count();
        boolean everAccessed = lessons.stream().anyMatch(l -> l.lastAccessedAt() != null);

        // resume: the most recently accessed lesson, else the first lesson of the course
        LessonProgressItem resume = lessons.stream()
                .filter(l -> l.lastAccessedAt() != null)
                .max(Comparator.comparing(LessonProgressItem::lastAccessedAt))
                .orElse(lessons.isEmpty() ? null : lessons.getFirst());

        return new CourseProgressResponse(courseId, courseTitle, studentId, total, done,
                ProgressStatus.percent(done, total), ProgressStatus.of(done, total, everAccessed),
                resume == null ? null : resume.lessonId(),
                resume == null ? null : resume.lessonTitle(),
                resume == null ? 0 : resume.lastPosition(),
                lessons);
    }

    private static ApiException courseNotFound(Long courseId) {
        return ApiException.notFound("COURSE_NOT_FOUND", "Course " + courseId + " does not exist");
    }
}
