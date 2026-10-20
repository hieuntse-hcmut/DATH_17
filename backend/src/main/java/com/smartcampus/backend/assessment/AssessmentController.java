package com.smartcampus.backend.assessment;

import com.smartcampus.backend.assessment.AssessmentModels.*;
import com.smartcampus.backend.common.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses/{courseId}")
@Tag(name = "Assessment", description = "Course question bank and quiz configuration")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@Validated
public class AssessmentController {
    private final AssessmentService service;

    public AssessmentController(AssessmentService service) { this.service = service; }

    @Operation(summary = "List course question bank (assigned lecturer or admin)")
    @GetMapping("/questions")
    public List<QuestionView> questions(@PathVariable @Positive Long courseId) {
        return service.questions(courseId);
    }

    @Operation(summary = "Create a question with options")
    @PostMapping("/questions")
    public ResponseEntity<QuestionView> createQuestion(@PathVariable @Positive Long courseId,
                                                        @Valid @RequestBody QuestionInput input) {
        QuestionView result = service.createQuestion(courseId, input);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/questions/" + result.id())).body(result);
    }

    @Operation(summary = "Replace a question and its options; blocked once used by a quiz")
    @PutMapping("/questions/{questionId}")
    public QuestionView updateQuestion(@PathVariable @Positive Long courseId,
                                       @PathVariable @Positive Long questionId,
                                       @Valid @RequestBody QuestionInput input) {
        return service.updateQuestion(courseId, questionId, input);
    }

    @Operation(summary = "Delete an unused question")
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable @Positive Long courseId,
                                               @PathVariable @Positive Long questionId) {
        service.deleteQuestion(courseId, questionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Create a draft quiz from course question IDs")
    @PostMapping("/quizzes")
    public ResponseEntity<QuizView> createQuiz(@PathVariable @Positive Long courseId,
                                                @Valid @RequestBody QuizInput input) {
        QuizView result = service.createQuiz(courseId, input);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/quizzes/" + result.quiz().id()))
                .body(result);
    }

    @Operation(summary = "Publish a draft quiz")
    @PostMapping("/quizzes/{quizId}/publish")
    public QuizView publish(@PathVariable @Positive Long courseId, @PathVariable @Positive Long quizId) {
        return service.publish(courseId, quizId);
    }

    @Operation(summary = "List course quizzes; students see published quizzes only")
    @GetMapping("/quizzes")
    public List<QuizSummary> quizzes(@PathVariable @Positive Long courseId) {
        return service.quizzes(courseId);
    }

    @Operation(summary = "View quiz; correct option flags are hidden from students")
    @GetMapping("/quizzes/{quizId}")
    public QuizView quiz(@PathVariable @Positive Long courseId, @PathVariable @Positive Long quizId) {
        return service.getQuiz(courseId, quizId);
    }
}
