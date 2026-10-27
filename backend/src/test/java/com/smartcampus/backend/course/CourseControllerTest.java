package com.smartcampus.backend.course;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smartcampus.backend.course.controller.CourseController;
import com.smartcampus.backend.course.dto.CourseResponse;
import com.smartcampus.backend.course.dto.CreateCourseRequest;
import com.smartcampus.backend.course.dto.UpdateCourseRequest;
import com.smartcampus.backend.course.entity.PublicationState;
import com.smartcampus.backend.course.exception.CourseNotFoundException;
import com.smartcampus.backend.course.service.CourseService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import tools.jackson.databind.json.JsonMapper;

import static org.mockito.Mockito.mock;

class CourseControllerTest {
    private final CourseService service = mock(CourseService.class);
    private MockMvc mvc;
    private final CourseResponse course = new CourseResponse(1L, "Intro", null,
            PublicationState.DRAFT, false, 7L, null, null);

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mvc = MockMvcBuilders.standaloneSetup(new CourseController(service))
                .setValidator(validator)
                .setMessageConverters(new JacksonJsonHttpMessageConverter(JsonMapper.builder().build()))
                .build();
    }

    @Test
    void listsAndReadsCourses() throws Exception {
        when(service.findAll()).thenReturn(List.of(course));
        when(service.findById(1L)).thenReturn(course);

        mvc.perform(get("/api/courses")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
        mvc.perform(get("/api/courses/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Intro"));
    }

    @Test
    void createsAndUpdatesCourse() throws Exception {
        when(service.create(any(CreateCourseRequest.class))).thenReturn(course);
        when(service.update(any(Long.class), any(UpdateCourseRequest.class))).thenReturn(course);

        mvc.perform(post("/api/courses").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Intro\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/courses/1"));
        mvc.perform(put("/api/courses/1").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Intro\",\"publicationState\":\"DRAFT\",\"enrollmentOpen\":false}"))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsInvalidBodyAndReportsMissingCourse() throws Exception {
        mvc.perform(post("/api/courses").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"  \"}"))
                .andExpect(status().isBadRequest());
        when(service.findById(99L)).thenThrow(new CourseNotFoundException(99L));
        mvc.perform(get("/api/courses/99")).andExpect(status().isNotFound());
    }
}

