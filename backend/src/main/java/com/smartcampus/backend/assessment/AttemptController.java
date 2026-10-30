package com.smartcampus.backend.assessment;

import com.smartcampus.backend.assessment.AttemptModels.*;
import com.smartcampus.backend.common.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses/{courseId}/quizzes/{quizId}/attempts")
@Tag(name = "Assessment attempts", description = "Start, resume, autosave and submit a quiz attempt")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@Validated
public class AttemptController {
    private final AttemptService service;

    public AttemptController(AttemptService service) { this.service = service; }

    @Operation(summary = "Start an attempt, or resume the in-progress one (student only)")
    @PostMapping
    public AttemptStart start(@PathVariable @Positive Long courseId, @PathVariable @Positive Long quizId) {
        return service.start(courseId, quizId);
    }

    @Operation(summary = "Autosave the answers of an in-progress attempt (student only)")
    @PutMapping("/{attemptId}/answers")
    public ResponseEntity<Void> save(@PathVariable @Positive Long courseId, @PathVariable @Positive Long quizId,
                                     @PathVariable @Positive Long attemptId, @RequestBody SubmitRequest body) {
        service.saveAnswers(courseId, quizId, attemptId, body);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Submit and auto-grade an attempt (student only)")
    @PostMapping("/{attemptId}/submit")
    public AttemptResult submit(@PathVariable @Positive Long courseId, @PathVariable @Positive Long quizId,
                                @PathVariable @Positive Long attemptId, @RequestBody SubmitRequest body) {
        return service.submit(courseId, quizId, attemptId, body);
    }
}