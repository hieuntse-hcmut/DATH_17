package com.smartcampus.backend;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end tests of Enrollment (full), Learning Progress, Analytics and Notification
 * through the real Spring Security filter chain and the real database.
 *
 * Needs MySQL running (docker compose up -d). Every test runs in a transaction that is
 * rolled back, so the local database is left unchanged.
 * Users: student_a 9001, student_b 9002 (INACTIVE), lecturer_a 9003 (owns every test course),
 * lecturer_b 9004 (owns nothing), admin_a 9005, student_c 9006.
 * Courses: 9101 published+open (lessons 9301-9303), 9102 draft, 9103 published+closed (lesson 9304).
 */
@SpringBootTest
@Transactional
@Sql("/sql/week42-test-data.sql")
@TestPropertySource(properties =
        "JWT_SECRET=c21hcnQtY2FtcHVzLXRlc3Qtand0LXNlY3JldC1rZXktYXQtbGVhc3QtMzItYnl0ZXMtbG9uZw==")
class Week42IntegrationTest {

    private static final String STUDENT_A = "student_a";
    private static final String STUDENT_C = "student_c";
    private static final String LECTURER_A = "lecturer_a";
    private static final String LECTURER_B = "lecturer_b";
    private static final String ADMIN = "admin_a";

    private static final int STUDENT_A_ID = 9001;
    private static final int STUDENT_C_ID = 9006;
    private static final int OPEN_COURSE = 9101;
    private static final int CLOSED_COURSE = 9103;

    @Autowired private WebApplicationContext context;
    @Autowired private JdbcTemplate jdbcTemplate;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    // ===================================================== enrollment (student)

    @Test
    void withdrawThenReEnroll_reusesTheSameRecord_andKeepsFullHistory() throws Exception {
        int enrollmentId = id(call(STUDENT_A, post("/api/courses/9101/enroll"))
                .andExpect(status().isCreated()), "$.data.enrollmentId");

        call(STUDENT_A, post("/api/courses/9101/withdraw").contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Schedule conflict\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("WITHDRAWN"));
        call(STUDENT_A, get("/api/enrollments/me")).andExpect(jsonPath("$.data.length()").value(0));
        call(STUDENT_A, post("/api/courses/9101/withdraw"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error_code").value("ENROLLMENT_NOT_ACTIVE"));

        call(STUDENT_A, post("/api/courses/9101/enroll"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.enrollmentId").value(enrollmentId))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        call(STUDENT_A, get("/api/enrollments/" + enrollmentId + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].newStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.data[1].newStatus").value("WITHDRAWN"))
                .andExpect(jsonPath("$.data[1].reason").value("Schedule conflict"))
                .andExpect(jsonPath("$.data[2].previousStatus").value("WITHDRAWN"));
        call(STUDENT_C, get("/api/enrollments/" + enrollmentId + "/history"))
                .andExpect(status().isForbidden());
    }

    @Test
    void removedStudent_cannotReEnroll_untilLecturerReinstates() throws Exception {
        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());

        call(LECTURER_A, post("/api/courses/9101/enrollments/9001/remove").contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Test removal\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REMOVED"));

        call(STUDENT_A, post("/api/courses/9101/enroll"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("ENROLLMENT_REMOVED"));

        call(LECTURER_A, post("/api/courses/9101/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9001}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        assertEquals(1, count("SELECT COUNT(*) FROM audit_logs WHERE action = 'ENROLLMENT_REMOVED' AND target_user_id = 9001"));
    }

    // ======================================================= enrollment (staff)

    @Test
    void roster_onlyForTheCourseLecturerAndAdmins() throws Exception {
        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());

        call(LECTURER_A, get("/api/courses/9101/enrollments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].studentId").value(STUDENT_A_ID))
                .andExpect(jsonPath("$.data[0].accountStatus").value("ACTIVE"));
        call(ADMIN, get("/api/courses/9101/enrollments")).andExpect(status().isOk());
        call(LECTURER_B, get("/api/courses/9101/enrollments"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("NOT_COURSE_STAFF"));
        call(STUDENT_A, get("/api/courses/9101/enrollments")).andExpect(status().isForbidden());
        call(LECTURER_A, get("/api/courses/999999/enrollments"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("COURSE_NOT_FOUND"));
    }

    @Test
    void closedCourse_onlyAdminOverrideWithReason_andItIsAudited() throws Exception {
        call(LECTURER_A, post("/api/courses/9103/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9001}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("ENROLLMENT_CLOSED"));
        call(LECTURER_A, post("/api/courses/9103/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9001, \"adminOverride\": true, \"reason\": \"x\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("OVERRIDE_NOT_ALLOWED"));
        call(ADMIN, post("/api/courses/9103/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9001, \"adminOverride\": true}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("OVERRIDE_REASON_REQUIRED"));

        call(ADMIN, post("/api/courses/9103/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9001, \"adminOverride\": true, \"reason\": \"Late registration\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.studentId").value(STUDENT_A_ID))
                .andExpect(jsonPath("$.data.courseId").value(CLOSED_COURSE));

        assertEquals(1, count("SELECT COUNT(*) FROM audit_logs WHERE action = 'ENROLLMENT_OVERRIDE' AND target_user_id = 9001"));
        call(STUDENT_A, get("/api/notifications/me"))
                .andExpect(jsonPath("$.data[0].type").value("ENROLLED_BY_STAFF"));
    }

    @Test
    void staffEnroll_validatesTheBodyAndTheTarget() throws Exception {
        call(LECTURER_A, post("/api/courses/9101/enrollments").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERROR"));
        call(LECTURER_A, post("/api/courses/9101/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9004}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("NOT_A_STUDENT"));
        call(LECTURER_A, post("/api/courses/9101/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9002}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("STUDENT_INACTIVE"));
        call(LECTURER_B, post("/api/courses/9101/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"studentId\": 9001}"))
                .andExpect(status().isForbidden());
    }

    // ============================================================ notification

    @Test
    void removal_notifiesTheStudent_whoCanReadIt_butNobodyElseCan() throws Exception {
        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());
        call(LECTURER_A, post("/api/courses/9101/enrollments/9001/remove")).andExpect(status().isOk());

        call(STUDENT_A, get("/api/notifications/me/unread-count")).andExpect(jsonPath("$.data.unread").value(1));
        int notificationId = id(call(STUDENT_A, get("/api/notifications/me"))
                .andExpect(jsonPath("$.data[0].type").value("REMOVED_FROM_COURSE"))
                .andExpect(jsonPath("$.data[0].read").value(false)), "$.data[0].id");

        call(STUDENT_C, patch("/api/notifications/" + notificationId + "/read"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("NOTIFICATION_NOT_FOUND"));
        call(STUDENT_A, patch("/api/notifications/" + notificationId + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.read").value(true));
        call(STUDENT_A, get("/api/notifications/me/unread-count")).andExpect(jsonPath("$.data.unread").value(0));
        call(STUDENT_A, get("/api/notifications/me?unreadOnly=true")).andExpect(jsonPath("$.data.length()").value(0));
        call(STUDENT_A, patch("/api/notifications/me/read-all")).andExpect(jsonPath("$.data.marked").value(0));
    }

    // ======================================================== learning progress

    @Test
    void completingEveryLesson_reaches100Percent_andNotifiesTheStudent() throws Exception {
        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());
        call(STUDENT_A, get("/api/progress/me"))
                .andExpect(jsonPath("$.data[0].status").value("NOT_STARTED"))
                .andExpect(jsonPath("$.data[0].totalLessons").value(3));

        call(STUDENT_A, post("/api/lessons/9302/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completed").value(true))
                .andExpect(jsonPath("$.data.courseProgressPercent").value(33.3));

        call(STUDENT_A, put("/api/lessons/9301/progress").contentType(MediaType.APPLICATION_JSON)
                .content("{\"position\": 300, \"totalLength\": 600}"))
                .andExpect(jsonPath("$.data.completed").value(false))
                .andExpect(jsonPath("$.data.lastPosition").value(300));
        call(STUDENT_A, put("/api/lessons/9301/progress").contentType(MediaType.APPLICATION_JSON)
                .content("{\"position\": 545, \"totalLength\": 600}"))
                .andExpect(jsonPath("$.data.completed").value(true))
                .andExpect(jsonPath("$.data.courseCompletedLessons").value(2));

        call(STUDENT_A, get("/api/courses/9101/progress/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedLessons").value(2))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.lessons.length()").value(3))
                .andExpect(jsonPath("$.data.lessons[2].completed").value(false));

        call(STUDENT_A, post("/api/lessons/9303/complete"))
                .andExpect(jsonPath("$.data.courseProgressPercent").value(100.0));
        call(STUDENT_A, get("/api/progress/me")).andExpect(jsonPath("$.data[0].status").value("COMPLETED"));
        call(STUDENT_A, get("/api/notifications/me")).andExpect(jsonPath("$.data[0].type").value("COURSE_COMPLETED"));

        assertEquals(3, count("SELECT COUNT(*) FROM learning_activities WHERE student_id = 9001 AND event_type = 'LESSON_COMPLETED'"));
        assertEquals(1, count("SELECT COUNT(*) FROM learning_activities WHERE student_id = 9001 AND event_type = 'LESSON_PROGRESS'"));
    }

    @Test
    void progress_isOnlyForEnrolledStudentsOfPublishedCourses() throws Exception {
        call(STUDENT_A, post("/api/lessons/9301/complete"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("NOT_ENROLLED"));
        call(STUDENT_A, post("/api/lessons/999999/complete"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("LESSON_NOT_FOUND"));
        call(LECTURER_A, post("/api/lessons/9301/complete"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("NOT_A_STUDENT"));
        call(STUDENT_A, get("/api/courses/9101/progress/me"))
                .andExpect(status().isForbidden());

        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());
        call(STUDENT_A, put("/api/lessons/9301/progress").contentType(MediaType.APPLICATION_JSON)
                .content("{\"position\": -1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERROR"));
    }

    @Test
    void lecturer_seesClassProgress_andOneStudentsDetail() throws Exception {
        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());
        call(STUDENT_A, post("/api/lessons/9302/complete")).andExpect(status().isOk());

        call(LECTURER_A, get("/api/courses/9101/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].studentId").value(STUDENT_A_ID))
                .andExpect(jsonPath("$.data[0].completedLessons").value(1))
                .andExpect(jsonPath("$.data[0].progressPercent").value(33.3));
        call(LECTURER_A, get("/api/courses/9101/progress/students/9001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedLessons").value(1));
        call(LECTURER_B, get("/api/courses/9101/progress")).andExpect(status().isForbidden());
    }

    // ================================================================ analytics

    @Test
    void analytics_countsEnrollmentsAndCompletion_forCourseStaffOnly() throws Exception {
        call(STUDENT_A, post("/api/courses/9101/enroll")).andExpect(status().isCreated());
        call(STUDENT_C, post("/api/courses/9101/enroll")).andExpect(status().isCreated());
        call(STUDENT_A, post("/api/lessons/9301/complete")).andExpect(status().isOk());
        call(STUDENT_A, post("/api/lessons/9302/complete")).andExpect(status().isOk());
        call(STUDENT_A, post("/api/lessons/9303/complete")).andExpect(status().isOk());
        call(STUDENT_C, post("/api/courses/9101/withdraw")).andExpect(status().isOk());
        call(STUDENT_C, post("/api/courses/9101/enroll")).andExpect(status().isCreated());

        call(LECTURER_A, get("/api/analytics/courses/9101/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeEnrollments").value(2))
                .andExpect(jsonPath("$.data.totalEnrollments").value(2))
                .andExpect(jsonPath("$.data.totalLessons").value(3))
                .andExpect(jsonPath("$.data.studentsCompleted").value(1))
                .andExpect(jsonPath("$.data.studentsNotStarted").value(1))
                .andExpect(jsonPath("$.data.completionRate").value(50.0))
                .andExpect(jsonPath("$.data.averageProgressPercent").value(50.0));

        call(LECTURER_A, get("/api/analytics/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.courseId == 9101)].activeEnrollments").value(2));
        call(LECTURER_B, get("/api/analytics/courses/9101/summary")).andExpect(status().isForbidden());
        call(STUDENT_A, get("/api/analytics/courses/9101/summary")).andExpect(status().isForbidden());
        call(STUDENT_A, get("/api/analytics/courses"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("NOT_COURSE_STAFF"));
    }

    @Test
    void everyNewEndpoint_requiresLogin() throws Exception {
        mockMvc.perform(post("/api/courses/9101/withdraw")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/courses/9101/enrollments")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/lessons/9301/complete")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/progress/me")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/analytics/courses")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/notifications/me")).andExpect(status().isUnauthorized());
    }

    // =============================================================== helpers

    private ResultActions call(String username, MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request.with(user(username)));
    }

    private static int id(ResultActions result, String jsonPath) throws Exception {
        Number value = JsonPath.read(result.andReturn().getResponse().getContentAsString(), jsonPath);
        return value.intValue();
    }

    private int count(String sql) {
        Integer value = jdbcTemplate.queryForObject(sql, Integer.class);
        return value == null ? 0 : value;
    }
}
