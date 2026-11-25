package com.smartcampus.backend.enrollment.controller;

final class EnrollmentApiExamples {

    private EnrollmentApiExamples() {
    }

    static final String ENROLL_CREATED = """
            {
              "success": true,
              "data": {
                "enrollmentId": 1,
                "studentId": 9001,
                "courseId": 9101,
                "courseTitle": "Introduction to Spring Boot",
                "status": "ACTIVE",
                "enrolledAt": "2026-10-10T05:36:02"
              }
            }
            """;

    static final String MY_ENROLLMENTS_OK = """
            {
              "success": true,
              "data": [
                {
                  "enrollmentId": 1,
                  "courseId": 9101,
                  "courseTitle": "Introduction to Spring Boot",
                  "courseDescription": "Build REST APIs with Spring Boot",
                  "publicationState": "PUBLISHED",
                  "status": "ACTIVE",
                  "enrolledAt": "2026-10-10T05:36:02"
                }
              ]
            }
            """;

    static final String MY_ENROLLMENTS_EMPTY = """
            { "success": true, "data": [] }
            """;

    static final String COURSE_NOT_PUBLISHED = """
            { "success": false, "error_code": "COURSE_NOT_PUBLISHED", "error_message": "Course 9102 is not published" }
            """;

    static final String ENROLLMENT_CLOSED = """
            { "success": false, "error_code": "ENROLLMENT_CLOSED", "error_message": "Course 9103 is not accepting new enrollments" }
            """;

    static final String INVALID_PARAMETER = """
            { "success": false, "error_code": "INVALID_PARAMETER", "error_message": "Invalid value for 'courseId'" }
            """;

    static final String NOT_A_STUDENT = """
            { "success": false, "error_code": "NOT_A_STUDENT", "error_message": "Only students can enroll in courses" }
            """;

    static final String ACCOUNT_INACTIVE = """
            { "success": false, "error_code": "ACCOUNT_INACTIVE", "error_message": "Your account is inactive" }
            """;

    static final String COURSE_NOT_FOUND = """
            { "success": false, "error_code": "COURSE_NOT_FOUND", "error_message": "Course 999999 does not exist" }
            """;

    static final String ALREADY_ENROLLED = """
            { "success": false, "error_code": "ALREADY_ENROLLED", "error_message": "You are already enrolled in course 9101" }
            """;
}
