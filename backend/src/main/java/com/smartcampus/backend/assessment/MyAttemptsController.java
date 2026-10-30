package com.smartcampus.backend.assessment;

import com.smartcampus.backend.assessment.AttemptModels.AttemptSummary;
import com.smartcampus.backend.common.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses/{courseId}")
@Tag(name = "Assessment attempts")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@Validated
public class MyAttemptsController {
    private final AttemptService service;

    public MyAttemptsController(AttemptService service) { this.service = service; }

    @Operation(summary = "Attempt history of the current student in this course")
    @GetMapping("/my-attempts")
    public List<AttemptSummary> mine(@PathVariable @Positive Long courseId) {
        return service.mine(courseId);
    }
}