package com.smartcampus.backend.discussion;

import com.smartcampus.backend.common.config.OpenApiConfig;
import com.smartcampus.backend.discussion.DiscussionModels.*;
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
@RequestMapping("/api/courses/{courseId}/discussions")
@Tag(name = "Discussion", description = "Course comments and replies")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@Validated
public class DiscussionController {
    private final DiscussionService service;

    public DiscussionController(DiscussionService service) { this.service = service; }

    @Operation(summary = "List comments and replies for course participants")
    @GetMapping
    public List<CommentView> list(@PathVariable @Positive Long courseId) { return service.list(courseId); }

    @Operation(summary = "Post a question or reply using parentId")
    @PostMapping
    public ResponseEntity<CommentView> create(@PathVariable @Positive Long courseId,
                                               @Valid @RequestBody CommentInput input) {
        CommentView result = service.create(courseId, input);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/discussions/" + result.id()))
                .body(result);
    }

    @Operation(summary = "Edit own comment; course lecturer or admin can moderate")
    @PutMapping("/{id}")
    public CommentView edit(@PathVariable @Positive Long courseId, @PathVariable @Positive Long id,
                            @Valid @RequestBody EditInput input) {
        return service.edit(courseId, id, input);
    }

    @Operation(summary = "Soft delete a comment while preserving its replies")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive Long courseId, @PathVariable @Positive Long id) {
        service.delete(courseId, id);
        return ResponseEntity.noContent().build();
    }
}
