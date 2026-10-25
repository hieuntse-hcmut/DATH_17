package com.smartcampus.backend.course.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.smartcampus.backend.course.entity.PublicationState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body of POST /api/courses.
 * The creator is taken from the JWT (CourseService.create), never from the request body,
 * so a client cannot create a course on behalf of another lecturer.
 * A "createdBy" sent by an old client is silently ignored.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CreateCourseRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        PublicationState publicationState,
        Boolean enrollmentOpen
) {}
