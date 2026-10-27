package com.smartcampus.backend.learningcontent;

import jakarta.persistence.EntityManager;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql("/sql/week42-test-data.sql")
class LearningContentIntegrationTest {

    private static final long COURSE_ID = 9101L;
    private static final int TEST_ORDER = 900;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private EntityManager entityManager;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    private ResultActions call(
            String username,
            MockHttpServletRequestBuilder request
    ) throws Exception {
        return mockMvc.perform(
                request.with(user(
                        userDetailsService.loadUserByUsername(username)
                ))
        );
    }

    private int id(ResultActions result) throws Exception {
        String json = result.andReturn()
                .getResponse()
                .getContentAsString();

        Number value = JsonPath.read(json, "$.id");
        return value.intValue();
    }

    private int count(String sql, Object... args) {
        entityManager.flush();

        Integer value = jdbcTemplate.queryForObject(
                sql, Integer.class, args
        );

        return value == null ? 0 : value;
    }

    private String chaptersUrl() {
        return "/api/courses/" + COURSE_ID + "/chapters";
    }

    private String lessonsUrl(long chapterId) {
        return chaptersUrl() + "/" + chapterId + "/lessons";
    }

    private String materialsUrl(long chapterId, long lessonId) {
        return lessonsUrl(chapterId)
                + "/" + lessonId + "/materials";
    }

    private int createChapter(int order) throws Exception {
        ResultActions result = call(
                "lecturer_a",
                post(chaptersUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Test Chapter",
                                  "orderIndex": %d
                                }
                                """.formatted(order))
        ).andExpect(status().isCreated());

        return id(result);
    }

    private int createLesson(long chapterId, int order)
            throws Exception {
        ResultActions result = call(
                "lecturer_a",
                post(lessonsUrl(chapterId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Test Lesson",
                                  "contentType": "VIDEO",
                                  "orderIndex": %d
                                }
                                """.formatted(order))
        ).andExpect(status().isCreated());

        return id(result);
    }

    private int createMaterial(long chapterId, long lessonId)
            throws Exception {
        ResultActions result = call(
                "lecturer_a",
                post(materialsUrl(chapterId, lessonId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Test Material",
                                  "fileUrl": "https://example.com/file.pdf",
                                  "fileType": "PDF"
                                }
                                """)
        ).andExpect(status().isCreated());

        return id(result);
    }

    // ============================
    // CHAPTER
    // ============================

    @Test
    void lecturerCanCreateChapter() throws Exception {
        int chapterId = createChapter(TEST_ORDER);

        assertEquals(
                1,
                count(
                        "SELECT COUNT(*) FROM chapters WHERE id = ?",
                        chapterId
                )
        );
    }

    @Test
    void lecturerCanUpdateChapter() throws Exception {
        int chapterId = createChapter(TEST_ORDER);

        call(
                "lecturer_a",
                put(chaptersUrl() + "/" + chapterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated Chapter",
                                  "orderIndex": 901
                                }
                                """)
        ).andExpect(status().isOk());

        assertEquals(
                1,
                count(
                        """
                        SELECT COUNT(*)
                        FROM chapters
                        WHERE id = ?
                          AND title = 'Updated Chapter'
                          AND order_index = 901
                        """,
                        chapterId
                )
        );
    }

    @Test
    void lecturerCanDeleteChapter() throws Exception {
        int chapterId = createChapter(TEST_ORDER);

        call(
                "lecturer_a",
                delete(chaptersUrl() + "/" + chapterId)
        ).andExpect(status().isNoContent());

        assertEquals(
                0,
                count(
                        "SELECT COUNT(*) FROM chapters WHERE id = ?",
                        chapterId
                )
        );
    }

    @Test
    void duplicateChapterOrderReturnsConflict() throws Exception {
        createChapter(TEST_ORDER);

        call(
                "lecturer_a",
                post(chaptersUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Duplicate",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isConflict());
    }

    @Test
    void studentCannotCreateChapter() throws Exception {
        call(
                "student_a",
                post(chaptersUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Forbidden",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isForbidden());
    }

    @Test
    void otherLecturerCannotCreateChapter() throws Exception {
        call(
                "lecturer_b",
                post(chaptersUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Forbidden",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isForbidden());
    }

    @Test
    void adminCanCreateChapter() throws Exception {
        call(
                "admin_a",
                post(chaptersUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Admin Chapter",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isCreated());
    }

    // ============================
    // LESSON
    // ============================

    @Test
    void lecturerCanCreateLesson() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);

        assertEquals(
                1,
                count(
                        "SELECT COUNT(*) FROM lessons WHERE id = ?",
                        lessonId
                )
        );
    }

    @Test
    void lecturerCanUpdateLesson() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);

        call(
                "lecturer_a",
                put(lessonsUrl(chapterId) + "/" + lessonId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated Lesson",
                                  "contentType": "PDF",
                                  "orderIndex": 901
                                }
                                """)
        ).andExpect(status().isOk());

        assertEquals(
                1,
                count(
                        """
                        SELECT COUNT(*)
                        FROM lessons
                        WHERE id = ?
                          AND title = 'Updated Lesson'
                        """,
                        lessonId
                )
        );
    }

    @Test
    void lecturerCanDeleteLesson() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);

        call(
                "lecturer_a",
                delete(lessonsUrl(chapterId) + "/" + lessonId)
        ).andExpect(status().isNoContent());

        assertEquals(
                0,
                count(
                        "SELECT COUNT(*) FROM lessons WHERE id = ?",
                        lessonId
                )
        );
    }

    @Test
    void duplicateLessonOrderReturnsConflict() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        createLesson(chapterId, TEST_ORDER);

        call(
                "lecturer_a",
                post(lessonsUrl(chapterId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Duplicate Lesson",
                                  "contentType": "VIDEO",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isConflict());
    }

    @Test
    void studentCannotCreateLesson() throws Exception {
        int chapterId = createChapter(TEST_ORDER);

        call(
                "student_a",
                post(lessonsUrl(chapterId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Forbidden",
                                  "contentType": "VIDEO",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isForbidden());
    }

    // ============================
    // LEARNING MATERIAL
    // ============================

    @Test
    void lecturerCanCreateMaterial() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);
        int materialId = createMaterial(chapterId, lessonId);

        assertEquals(
                1,
                count(
                        """
                        SELECT COUNT(*)
                        FROM learning_materials
                        WHERE id = ?
                        """,
                        materialId
                )
        );
    }

    @Test
    void lecturerCanUpdateMaterial() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);
        int materialId = createMaterial(chapterId, lessonId);

        call(
                "lecturer_a",
                put(
                        materialsUrl(chapterId, lessonId)
                                + "/" + materialId
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated Material",
                                  "fileUrl": "https://example.com/new.pdf",
                                  "fileType": "PDF"
                                }
                                """)
        ).andExpect(status().isOk());

        assertEquals(
                1,
                count(
                        """
                        SELECT COUNT(*)
                        FROM learning_materials
                        WHERE id = ?
                          AND title = 'Updated Material'
                        """,
                        materialId
                )
        );
    }

    @Test
    void lecturerCanDeleteMaterial() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);
        int materialId = createMaterial(chapterId, lessonId);

        call(
                "lecturer_a",
                delete(
                        materialsUrl(chapterId, lessonId)
                                + "/" + materialId
                )
        ).andExpect(status().isNoContent());

        assertEquals(
                0,
                count(
                        """
                        SELECT COUNT(*)
                        FROM learning_materials
                        WHERE id = ?
                        """,
                        materialId
                )
        );
    }

    @Test
    void studentCannotCreateMaterial() throws Exception {
        int chapterId = createChapter(TEST_ORDER);
        int lessonId = createLesson(chapterId, TEST_ORDER);

        call(
                "student_a",
                post(materialsUrl(chapterId, lessonId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Forbidden",
                                  "fileUrl": "https://example.com/file.pdf",
                                  "fileType": "PDF"
                                }
                                """)
        ).andExpect(status().isForbidden());
    }

    // ============================
    // AUTHENTICATION
    // ============================

    @Test
    void anonymousCannotCreateChapter() throws Exception {
        mockMvc.perform(
                post(chaptersUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Anonymous",
                                  "orderIndex": 900
                                }
                                """)
        ).andExpect(status().isUnauthorized());
    }
}

