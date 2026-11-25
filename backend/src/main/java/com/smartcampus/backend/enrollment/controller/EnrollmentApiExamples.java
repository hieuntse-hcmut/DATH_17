package com.smartcampus.backend.enrollment.controller;

final class EnrollmentApiExamples {

    private EnrollmentApiExamples() {
    }

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
}
