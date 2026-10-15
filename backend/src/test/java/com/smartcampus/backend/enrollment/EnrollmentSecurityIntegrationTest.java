package com.smartcampus.backend.enrollment;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@Sql("/sql/enrollment-auth-test-data.sql")
@TestPropertySource(properties =
        "JWT_SECRET=c21hcnQtY2FtcHVzLXRlc3Qtand0LXNlY3JldC1rZXktYXQtbGVhc3QtMzItYnl0ZXMtbG9uZw==")
class EnrollmentSecurityIntegrationTest {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final String LOGIN_BODY = """
            {"username": "student_a", "password": "123456"}
            """;
    private static final String TOKEN_JSON_PATH = "$..access_token";

    private static final String ENROLL_OPEN_COURSE = "/api/courses/9101/enroll";
    private static final String MY_ENROLLMENTS = "/api/enrollments/me";
    private static final int STUDENT_A_ID = 9001;
    private static final int STUDENT_B_ID = 9002;
    private static final int OPEN_COURSE_ID = 9101;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void enroll_withoutToken_returns401() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void myEnrollments_withoutToken_returns401() throws Exception {
        mockMvc.perform(get(MY_ENROLLMENTS))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void enroll_withInvalidToken_returns401() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE)
                        .header("Authorization", "Bearer this.is-not.a-valid-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void enroll_withOnlyTheOldPhase1Header_returns401() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE)
                        .header("X-User-Id", String.valueOf(STUDENT_A_ID)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "lecturer_a", roles = "LECTURER")
    void enroll_asLecturer_returns403() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student_b", roles = "STUDENT")
    void enroll_asInactiveStudent_returns403() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("ACCOUNT_INACTIVE"));
    }

    @Test
    @WithMockUser(username = "student_a", roles = "STUDENT")
    void enroll_asStudent_returns201_forTheLoggedInStudent() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentId").value(STUDENT_A_ID))
                .andExpect(jsonPath("$.data.courseId").value(OPEN_COURSE_ID))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "student_a", roles = "STUDENT")
    void enroll_cannotEnrollSomeoneElseBySpoofingTheOldHeader() throws Exception {
        // Logged in as student_a but pretends to be student_b: the id must come from the login.
        mockMvc.perform(post(ENROLL_OPEN_COURSE)
                        .header("X-User-Id", String.valueOf(STUDENT_B_ID)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.studentId").value(STUDENT_A_ID));
    }

    @Test
    @WithMockUser(username = "student_a", roles = "STUDENT")
    void enroll_twice_returns409() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isCreated());

        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error_code").value("ALREADY_ENROLLED"));
    }

    @Test
    @WithMockUser(username = "student_a", roles = "STUDENT")
    void enrolledCourse_appearsInMyEnrollments() throws Exception {
        mockMvc.perform(post(ENROLL_OPEN_COURSE))
                .andExpect(status().isCreated());

        mockMvc.perform(get(MY_ENROLLMENTS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].courseId").value(OPEN_COURSE_ID))
                .andExpect(jsonPath("$.data[0].status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "student_a", roles = "STUDENT")
    void myEnrollments_doesNotShowOtherStudentsEnrollments() throws Exception {
        jdbcTemplate.update(
                "INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'ACTIVE')",
                STUDENT_B_ID, OPEN_COURSE_ID);

        mockMvc.perform(get(MY_ENROLLMENTS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void realJwt_loginThenEnrollThenListMyCourses() throws Exception {
        String loginResponse = mockMvc.perform(post(LOGIN_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        java.util.List<String> tokens = JsonPath.read(loginResponse, "$..accessToken");
        if (tokens.isEmpty()) {
            tokens = JsonPath.read(loginResponse, "$..access_token");
        }
        org.junit.jupiter.api.Assertions.assertFalse(tokens.isEmpty(),
                "Không tìm thấy token trong response login: " + loginResponse);
        String bearer = "Bearer " + tokens.getFirst();

        mockMvc.perform(post(ENROLL_OPEN_COURSE).header("Authorization", bearer))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.studentId").value(STUDENT_A_ID));

        mockMvc.perform(get(MY_ENROLLMENTS).header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].courseId").value(OPEN_COURSE_ID));
    }
}
