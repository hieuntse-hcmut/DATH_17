package com.smartcampus.backend.security;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm tra gọi API trái phép.
 *
 * Mỗi test mô tả hành vi ĐÚNG. Test nào đang ĐỎ là một lỗ hổng chưa vá.
 * Đăng nhập bằng JWT thật qua /api/auth/login để đi đúng filter chain như production
 * (CourseAccess cần principal là CustomUserDetails, nên không dùng user("...") của spring-security-test).
 *
 * Dữ liệu (week42-test-data.sql): student_a 9001, student_b 9002 (INACTIVE),
 * lecturer_a 9003 (chủ mọi course test), lecturer_b 9004 (không phụ trách course nào).
 * Course 9101 published+open (chapter 9201, 9202; lesson 9301 VIDEO, 9302 TEXT, 9303 PDF),
 * 9102 draft, 9103 published+closed.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql("/sql/week42-test-data.sql")
class AuthorizationHolesTest {

    private static final String STUDENT = "student_a";
    private static final String LECTURER_OWNER = "lecturer_a";
    private static final String LECTURER_OTHER = "lecturer_b";
    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    private static final String PUBLISH_AND_OPEN = """
            {"title":"Hacked","publicationState":"PUBLISHED","enrollmentOpen":true}
            """;

    @Autowired private WebApplicationContext context;
    private MockMvc mvc;
    private final Map<String, String> tokens = new HashMap<>();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    // ================================================================ course

    @Test
    void student_cannotCreateCourse() throws Exception {
        as(STUDENT, post("/api/courses").contentType(JSON).content("""
                {"title":"Hack","createdBy":9003,"publicationState":"PUBLISHED","enrollmentOpen":true}
                """)).andExpect(status().isForbidden());
    }

    /** createdBy phải lấy từ JWT, không lấy từ body (sau khi bỏ field createdBy khỏi CreateCourseRequest). */
    @Test
    void createdBy_comesFromJwt_notFromRequestBody() throws Exception {
        as(LECTURER_OTHER, post("/api/courses").contentType(JSON).content("""
                {"title":"Spoofed","createdBy":9003}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.createdBy").value(9004));
    }

    @Test
    void student_cannotUpdateCourse() throws Exception {
        as(STUDENT, put("/api/courses/9101").contentType(JSON).content(PUBLISH_AND_OPEN))
                .andExpect(status().isForbidden());
    }

    @Test
    void unassignedLecturer_cannotUpdateCourse() throws Exception {
        as(LECTURER_OTHER, put("/api/courses/9101").contentType(JSON).content(PUBLISH_AND_OPEN))
                .andExpect(status().isForbidden());
    }

    /** Đối chứng: chủ khoá học vẫn sửa được. */
    @Test
    void assignedLecturer_canUpdateCourse() throws Exception {
        as(LECTURER_OWNER, put("/api/courses/9101").contentType(JSON).content(PUBLISH_AND_OPEN))
                .andExpect(status().isOk());
    }

    /** Chuỗi tấn công: student tự mở cửa sổ đăng ký của khoá đã đóng rồi tự enroll. */
    @Test
    void student_cannotReopenClosedCourse_thenSelfEnroll() throws Exception {
        as(STUDENT, put("/api/courses/9103").contentType(JSON).content(PUBLISH_AND_OPEN));
        as(STUDENT, post("/api/courses/9103/enroll"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("ENROLLMENT_CLOSED"));
    }

    /** Chuỗi tấn công: student tự publish khoá DRAFT rồi tự enroll. */
    @Test
    void student_cannotPublishDraftCourse_thenSelfEnroll() throws Exception {
        as(STUDENT, put("/api/courses/9102").contentType(JSON).content(PUBLISH_AND_OPEN));
        as(STUDENT, post("/api/courses/9102/enroll"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("COURSE_NOT_PUBLISHED"));
    }

    @Test
    void student_cannotSeeDraftCourse() throws Exception {
        as(STUDENT, get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 9102)]").isEmpty());
        as(STUDENT, get("/api/courses/9102")).andExpect(status().is4xxClientError());
    }

    // ====================================================== learning content

    @Test
    void notEnrolledStudent_cannotReadCourseContent() throws Exception {
        as(STUDENT, get("/api/courses/9101/chapters")).andExpect(status().isForbidden());
        as(STUDENT, get("/api/courses/9101/chapters/9201/lessons")).andExpect(status().isForbidden());
        as(STUDENT, get("/api/courses/9101/chapters/9201/lessons/9301/materials"))
                .andExpect(status().isForbidden());
    }

    @Test
    void unassignedLecturer_cannotReadCourseContent() throws Exception {
        as(LECTURER_OTHER, get("/api/courses/9101/chapters")).andExpect(status().isForbidden());
    }

    /** Đối chứng: student đã enroll vẫn đọc được nội dung. */
    @Test
    void enrolledStudent_canReadCourseContent() throws Exception {
        enroll(STUDENT, 9101);
        as(STUDENT, get("/api/courses/9101/chapters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ===================================================== learning progress

    /** "Mark as done" chỉ dành cho nội dung không đo được (TEXT). Video/PDF phải qua PUT /progress. */
    @Test
    void student_cannotMarkVideoLessonDone_withoutWatching() throws Exception {
        enroll(STUDENT, 9101);
        as(STUDENT, get("/api/materials/9401/download"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("INVALID_MATERIAL_ACTION"));
        as(STUDENT, get("/api/materials/9402/download"))
                .andExpect(status().isFound());
    }

    /** V5: độ dài bài lấy từ lessons.total_length (9301 = 600 giây), không lấy từ body. */
    @Test
    void student_cannotCompleteVideo_byFakingTotalLength() throws Exception {
        enroll(STUDENT, 9101);
        as(STUDENT, put("/api/materials/9401/progress").contentType(JSON)
                .content("{\"position\": 1, \"totalLength\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completed").value(false));
        // Xem thật tới 90% của 600 giây thì hoàn thành
        as(STUDENT, put("/api/materials/9401/progress").contentType(JSON)
                .content("{\"position\": 540}"))
                .andExpect(jsonPath("$.data.completed").value(true));
    }

    // ============================================================ assessment

    @Test
    void student_cannotReadQuizQuestions_beforeStartTime() throws Exception {
        String question = as(LECTURER_OWNER, post("/api/courses/9101/questions").contentType(JSON).content("""
                {"content":"2 + 2?","type":"SINGLE_CHOICE","options":[
                  {"content":"4","correct":true},{"content":"5","correct":false}]}
                """)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        int questionId = JsonPath.read(question, "$.id");

        // MySQL TIMESTAMP tối đa 2038-01-19, nên dùng 2037
        String quiz = as(LECTURER_OWNER, post("/api/courses/9101/quizzes").contentType(JSON).content("""
                {"title":"Midterm","startTime":"2037-12-31T08:00:00","endTime":"2037-12-31T09:00:00",
                 "maxAttempts":1,"questions":[{"questionId":%d,"points":1}]}
                """.formatted(questionId))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        int quizId = JsonPath.read(quiz, "$.quiz.id");
        as(LECTURER_OWNER, post("/api/courses/9101/quizzes/" + quizId + "/publish")).andExpect(status().isOk());

        enroll(STUDENT, 9101);
        as(STUDENT, get("/api/courses/9101/quizzes/" + quizId)).andExpect(status().isForbidden());
    }

    // ================================================================= auth

    /** Tài khoản INACTIVE + sai mật khẩu phải trả về giống hệt tài khoản ACTIVE + sai mật khẩu. */
    @Test
    void login_inactiveAccount_isIndistinguishableFromWrongPassword() throws Exception {
        MvcResult active = login("student_a", "wrong-password");
        MvcResult inactive = login("student_b", "wrong-password");

        assertEquals(401, active.getResponse().getStatus());
        assertEquals(active.getResponse().getStatus(), inactive.getResponse().getStatus());
        assertEquals(active.getResponse().getContentAsString(), inactive.getResponse().getContentAsString());
    }

    // ============================================================== helpers

    private ResultActions as(String username, MockHttpServletRequestBuilder request) throws Exception {
        return mvc.perform(request.header("Authorization", token(username)));
    }

    private String token(String username) throws Exception {
        String cached = tokens.get(username);
        if (cached != null) {
            return cached;
        }
        String body = login(username, "123456").getResponse().getContentAsString();
        String token = "Bearer " + JsonPath.<String>read(body, "$.accessToken");
        tokens.put(username, token);
        return token;
    }

    private MvcResult login(String username, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andReturn();
    }

    private void enroll(String username, int courseId) throws Exception {
        as(username, post("/api/courses/" + courseId + "/enroll")).andExpect(status().isCreated());
    }
}
