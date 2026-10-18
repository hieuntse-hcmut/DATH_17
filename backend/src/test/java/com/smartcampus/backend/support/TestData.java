package com.smartcampus.backend.support;

import com.smartcampus.backend.common.security.UserAccount;
import com.smartcampus.backend.enrollment.entity.Enrollment;
import com.smartcampus.backend.enrollment.entity.EnrollmentStatus;
import com.smartcampus.backend.enrollment.repository.projection.CourseEnrollmentInfo;
import com.smartcampus.backend.enrollment.repository.projection.UserAccountInfo;
import org.springframework.test.util.ReflectionTestUtils;

/** Small builders shared by the unit tests. */
public final class TestData {

    private TestData() {
    }

    public static Enrollment enrollment(Long id, Long studentId, Long courseId, EnrollmentStatus status) {
        Enrollment e = new Enrollment(studentId, courseId);
        ReflectionTestUtils.setField(e, "id", id);
        ReflectionTestUtils.setField(e, "status", status);
        return e;
    }

    public static CourseEnrollmentInfo course(Long id, String title, String publicationState, String window) {
        return new CourseEnrollmentInfo() {
            @Override public Long getId() { return id; }
            @Override public String getTitle() { return title; }
            @Override public String getPublicationState() { return publicationState; }
            @Override public String getEnrollmentWindow() { return window; }
        };
    }

    public static UserAccountInfo userInfo(Long id, String role, String status) {
        return new UserAccountInfo() {
            @Override public Long getId() { return id; }
            @Override public String getRole() { return role; }
            @Override public String getStatus() { return status; }
        };
    }

    public static UserAccount student(Long id) {
        return new UserAccount(id, UserAccount.STUDENT, "ACTIVE", "Student " + id);
    }

    public static UserAccount lecturer(Long id) {
        return new UserAccount(id, UserAccount.LECTURER, "ACTIVE", "Lecturer " + id);
    }

    public static UserAccount admin(Long id) {
        return new UserAccount(id, UserAccount.ADMIN, "ACTIVE", "Admin " + id);
    }
}
