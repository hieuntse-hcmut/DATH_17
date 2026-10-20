package com.smartcampus.backend.enrollment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

/** Optional body with a reason (withdraw, remove). */
@Schema(description = "Optional reason, stored in the enrollment history")
public record ReasonRequest(
        @Schema(example = "Schedule conflict", nullable = true)
        @Size(max = 1000) String reason
) {
}
