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
import com.smartcampus.backend.progress.repository.LearningMaterialProgressRepository;
import com.smartcampus.backend.learningcontent.repository.LearningMaterialRepository;
import com.smartcampus.backend.learningcontent.entity.LearningMaterial;
import com.smartcampus.backend.progress.repository.projection.LessonContextView;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.net.URI;

/**
 * Learning Progress (docs/01-requirements/04-learning-progress.md):
 * mark a lesson complete, save the resume position, course progress, "My Courses",
 * lecturer class view, and LearningActivity events for Learning Analytics.
 */
@Service
public class LearningProgressService {

    static final int COMPLETION_THRESHOLD_PERCENT = 90;

    private final LearningProgressRepository progressRepository;
    private final LearningMaterialProgressRepository materialProgressRepository;
    private final LearningMaterialRepository materialRepository;
    private final LearningActivityRepository activityRepository;
    private final CourseAccessGuard courseAccessGuard;
    private final NotificationService notificationService;

    public LearningProgressService(LearningProgressRepository progressRepository,
                                   LearningMaterialProgressRepository materialProgressRepository,
                                   LearningMaterialRepository materialRepository,
                                   LearningActivityRepository activityRepository,
                                   CourseAccessGuard courseAccessGuard,
                                   NotificationService notificationService) {
        this.progressRepository = progressRepository;
        this.materialProgressRepository = materialProgressRepository;
        this.materialRepository = materialRepository;
        this.activityRepository = activityRepository;
        this.courseAccessGuard = courseAccessGuard;
        this.notificationService = notificationService;
    }

    /** VIDEO: save furthest watched position. Client cannot supply total length. */
    @Transactional
    public LessonProgressResponse updateMaterialPosition(Long studentId, Long materialId, UpdatePositionRequest request) {
        LearningMaterial material = requireMaterial(materialId);
        LessonContextView lesson = requireLessonAccess(studentId, material.getLessonId());
        if (!"VIDEO".equals(normalizeType(material.getFileType()))) {
            throw ApiException.badRequest("INVALID_MATERIAL_TYPE", "Position tracking is only available for VIDEO");
        }
        if (request.position() < 0) {
            throw ApiException.badRequest("INVALID_POSITION", "Position cannot be negative");
        }
        Integer total = material.getTotalLength();
        int position = total == null ? request.position() : Math.min(request.position(), total);
        materialProgressRepository.upsert(studentId, materialId, position, reachesThreshold(position, total));
        if (activityRepository.countRecentEvents(studentId, lesson.getLessonId(), LearningEventType.LESSON_PROGRESS.name()) == 0) {
            activityRepository.save(new LearningActivity(studentId, lesson.getLessonId(),
                    LearningEventType.LESSON_PROGRESS, position, total));
        }
        synchronizeLesson(studentId, lesson);
        return lessonResponse(studentId, lesson);
    }

    /** Called by GET /api/materials/{id}/download or /open, not by a public mark-complete API. */
    @Transactional
    public String accessMaterial(Long studentId, Long materialId, boolean openLink) {
        LearningMaterial material = requireMaterial(materialId);
        LessonContextView lesson = requireLessonAccess(studentId, material.getLessonId());
        boolean isLink = "LINK".equals(normalizeType(material.getFileType()));
        if (isLink != openLink || "VIDEO".equals(normalizeType(material.getFileType()))) {
            throw ApiException.badRequest("INVALID_MATERIAL_ACTION", "Action does not match material type");
        }
        String url = material.getFileUrl();
        URI uri;
        try { uri = URI.create(url); }
        catch (IllegalArgumentException ex) {
            throw ApiException.badRequest("INVALID_MATERIAL_URL", "Material URL is invalid");
        }
        if (uri.getHost() == null || !("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))) {
            throw ApiException.badRequest("INVALID_MATERIAL_URL", "Only HTTP(S) material URLs are supported");
        }
        materialProgressRepository.upsert(studentId, materialId, 0, true);
        synchronizeLesson(studentId, lesson);
        return url;
    }

    private LearningMaterial requireMaterial(Long materialId) {
        return materialRepository.findById(materialId)
                .orElseThrow(() -> ApiException.notFound("MATERIAL_NOT_FOUND", "Material " + materialId + " does not exist"));
    }

    private static String normalizeType(String type) {
        return type == null ? "" : type.trim().toUpperCase(Locale.ROOT);
    }

    /** Recompute the aggregate lesson state after any material progress update. */
    private void synchronizeLesson(Long studentId, LessonContextView lesson) {
        long count = materialProgressRepository.countMaterials(lesson.getLessonId());
        boolean completed = count > 0 && materialProgressRepository.countIncompleteMaterials(studentId, lesson.getLessonId()) == 0;
        boolean wasCompleted = isCompleted(studentId, lesson.getLessonId());
        progressRepository.setLessonCompletion(studentId, lesson.getLessonId(), completed);
        if (completed && !wasCompleted) onLessonCompleted(studentId, lesson, null, null);
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
