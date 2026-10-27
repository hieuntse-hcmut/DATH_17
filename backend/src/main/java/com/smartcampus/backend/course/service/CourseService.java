package com.smartcampus.backend.course.service;

import com.smartcampus.backend.auth.security.CustomUserDetails;
import com.smartcampus.backend.common.security.CourseAccess;
import com.smartcampus.backend.course.dto.CourseResponse;
import com.smartcampus.backend.course.dto.CreateCourseRequest;
import com.smartcampus.backend.course.dto.MyCourseResponse;
import com.smartcampus.backend.course.dto.UpdateCourseRequest;
import com.smartcampus.backend.course.entity.Course;
import com.smartcampus.backend.course.entity.PublicationState;
import com.smartcampus.backend.course.exception.CourseNotFoundException;
import com.smartcampus.backend.course.repository.CourseRepository;
import java.util.List;

import com.smartcampus.backend.user.entity.User;
import com.smartcampus.backend.user.entity.UserRole;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smartcampus.backend.user.repository.UserRepository;
import com.smartcampus.backend.progress.repository.LearningProgressRepository;
import com.smartcampus.backend.progress.repository.projection.MyCourseProgressView;

@Service
public class CourseService {
    private static final Sort BY_ID = Sort.by("id");

    private final CourseRepository repository;
    private final LearningProgressRepository learningProgressRepository;
    private final UserRepository userRepository;
    private final CourseAccess access;

    public CourseService(
            CourseRepository repository,
            LearningProgressRepository learningProgressRepository,
            UserRepository userRepository,
            CourseAccess access
    ) {
        this.repository = repository;
        this.learningProgressRepository = learningProgressRepository;
        this.userRepository = userRepository;
        this.access = access;
    }

    /** Students only see the PUBLISHED catalog; lecturers and admins see every course. */
    @Transactional(readOnly = true)
    public List<CourseResponse> findAll() {
        List<Course> courses = access.hasRole("STUDENT")
                ? repository.findByPublicationState(PublicationState.PUBLISHED, BY_ID)
                : repository.findAll(BY_ID);
        return courses.stream().map(CourseResponse::from).toList();
    }

    /** A DRAFT or ARCHIVED course does not exist for a student (404, not 403, so nothing leaks). */
    @Transactional(readOnly = true)
    public CourseResponse findById(Long id) {
        Course course = requireCourse(id);
        if (access.hasRole("STUDENT") && course.getPublicationState() != PublicationState.PUBLISHED) {
            throw new CourseNotFoundException(id);
        }
        return CourseResponse.from(course);
    }

    /** The creator is always the logged-in user (role checked by @PreAuthorize on the controller). */
    @Transactional
    public CourseResponse create(CreateCourseRequest request) {
        Long creatorId = access.userId();
        Course course = new Course(request.title().trim(), request.description(),
                request.publicationState() == null ? PublicationState.DRAFT : request.publicationState(),
                Boolean.TRUE.equals(request.enrollmentOpen()), creatorId);
        return CourseResponse.from(repository.saveAndFlush(course));
    }

    /** 404 if the course does not exist, 403 unless admin or the course's lecturer (created_by / course_lecturers). */
    @Transactional
    public CourseResponse update(Long id, UpdateCourseRequest request) {
        access.requireStaff(id);
        Course course = requireCourse(id);
        course.update(request.title().trim(), request.description(), request.publicationState(),
                request.enrollmentOpen());
        return CourseResponse.from(repository.saveAndFlush(course));
    }

    private Course requireCourse(Long id) {
        return repository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<MyCourseResponse> getMyCourses(
            CustomUserDetails currentUser) {

        Long userId = currentUser.getId();

        if (currentUser.getRole() == UserRole.STUDENT) {
            return getStudentCourses(userId);
        }

        if (currentUser.getRole() == UserRole.LECTURER) {
            return getLecturerCourses(userId);
        }

        throw new AccessDeniedException("Access denied");
    }

    private List<MyCourseResponse> getStudentCourses(Long studentId) {

        List<MyCourseProgressView> courses =
                learningProgressRepository.findMyCourseProgress(studentId);

        return courses.stream()
                .map(course -> {

                    long totalLesson = course.getTotalLessons();
                    long completeLesson = course.getCompletedLessons();

                    double progressPercent = totalLesson == 0
                            ? 0.0
                            : Math.min(
                            100.0,
                            completeLesson * 100.0 / totalLesson
                    );

                    return new MyCourseResponse(
                            course.getCourseId(),
                            course.getCourseTitle(),
                            course.getInstructorName(),
                            progressPercent,
                            totalLesson,
                            completeLesson
                    );
                })
                .toList();
    }

    private List<MyCourseResponse> getLecturerCourses(Long lecturerId) {

        List<Course> courses = repository.findByCreatedBy(lecturerId);

        String instructorName = userRepository.findById(lecturerId)
                .map(User::getFullName)
                .orElse("Unknown");

        return courses.stream()
                .map(course -> {

                    long totalLesson =
                            learningProgressRepository.countLessonsOfCourse(
                                    course.getId()
                            );

                    return new MyCourseResponse(
                            course.getId(),
                            course.getTitle(),
                            instructorName,
                            null,
                            totalLesson,
                            null
                    );
                })
                .toList();
    }
}
