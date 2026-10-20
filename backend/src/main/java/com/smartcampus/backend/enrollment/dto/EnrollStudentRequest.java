package com.smartcampus.backend.enrollment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Body of POST /api/courses/{courseId}/enrollments (staff enrolls a student). */
@Schema(description = "Enroll or reinstate a student (assigned lecturer or administrator)")
public record EnrollStudentRequest(
        @Schema(description = "Id of an existing ACTIVE student", example = "9002", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @Positive Long studentId,

        @Schema(description = "Administrator only: enroll even when the enrollment window is closed. Requires a reason.",
                example = "false")
        Boolean adminOverride,

        @Schema(description = "Reason; mandatory for an override, optional otherwise",
                example = "Late registration approved by the faculty", nullable = true)
        @Size(max = 1000) String reason
) {
}
