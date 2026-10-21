package com.smartcampus.backend.assessment;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql("/sql/assessment-discussion-data.sql")
class AssessmentDiscussionApiTest {
    @Autowired WebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach
    void setUp() { mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build(); }

    private String token(String username) throws Exception {
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"123456\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        java.util.List<String> tokens = JsonPath.read(response, "$..accessToken");
        return "Bearer " + tokens.getFirst();
    }

    @Test
    void quizLifecycle_hidesAnswerKeyAndBlocksUnenrolledStudent() throws Exception {
        String lecturer = token("assessment_lecturer");
        String student = token("assessment_student");
        String outsider = token("assessment_outsider");
        String question = mvc.perform(post("/api/courses/9911/questions")
                .header("Authorization", lecturer).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"content":"2 + 2?","type":"SINGLE_CHOICE","options":[
                          {"content":"4","correct":true},{"content":"5","correct":false}]}
                        """))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.options[0].correct").value(true))
                .andReturn().getResponse().getContentAsString();
        int questionId = JsonPath.read(question, "$.id");

        mvc.perform(post("/api/courses/9911/quizzes").header("Authorization", student)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Forbidden\",\"maxAttempts\":1,\"questions\":[{\"questionId\":"
                        + questionId + ",\"points\":2}]}"))
                .andExpect(status().isForbidden());

        String quiz = mvc.perform(post("/api/courses/9911/quizzes")
                .header("Authorization", lecturer).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Quiz 1\",\"maxAttempts\":1,\"questions\":[{\"questionId\":"
                        + questionId + ",\"points\":2}]}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.quiz.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();
        int quizId = JsonPath.read(quiz, "$.quiz.id");

        mvc.perform(get("/api/courses/9911/quizzes").header("Authorization", student))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/courses/9911/quizzes/{id}/publish", quizId)
                .header("Authorization", lecturer)).andExpect(status().isOk());
        mvc.perform(get("/api/courses/9911/quizzes/{id}", quizId).header("Authorization", student))
                .andExpect(status().isOk()).andExpect(jsonPath("$.questions[0].question.options[0].correct").doesNotExist());
        mvc.perform(get("/api/courses/9911/quizzes/{id}", quizId).header("Authorization", outsider))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/courses/9911/questions/{id}", questionId).header("Authorization", lecturer)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Changed\",\"type\":\"SHORT_ANSWER\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void discussionSupportsRepliesAndPreservesDeletedThread() throws Exception {
        String student = token("assessment_student");
        String lecturer = token("assessment_lecturer");
        String outsider = token("assessment_outsider");
        String root = mvc.perform(post("/api/courses/9911/discussions")
                .header("Authorization", student).contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Question about lesson\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        int rootId = JsonPath.read(root, "$.id");

        mvc.perform(post("/api/courses/9912/discussions").header("Authorization", lecturer)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Cross course\",\"parentId\":" + rootId + "}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/courses/9911/discussions").header("Authorization", lecturer)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Here is the answer\",\"parentId\":" + rootId + "}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.parentId").value(rootId));
        mvc.perform(get("/api/courses/9911/discussions").header("Authorization", outsider))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/courses/9911/discussions/{id}", rootId)
                .header("Authorization", student)).andExpect(status().isNoContent());
        mvc.perform(get("/api/courses/9911/discussions").header("Authorization", student))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].deleted").value(true))
                .andExpect(jsonPath("$[1].content").value("Here is the answer"));
    }
}
