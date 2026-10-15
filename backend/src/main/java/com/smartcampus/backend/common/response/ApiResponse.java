package com.smartcampus.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Envelope of every response: data on success, error_code + error_message on error")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        @Schema(description = "true on success, false on error", example = "false")
        boolean success,

        @Schema(description = "Payload; omitted on errors", nullable = true)
        T data,

        @Schema(description = "Machine-readable error code; omitted on success", example = "ALREADY_ENROLLED", nullable = true)
        @JsonProperty("error_code")
        String errorCode,

        @Schema(description = "Human-readable error message; omitted on success",
                example = "You are already enrolled in course 9101", nullable = true)
        @JsonProperty("error_message")
        String errorMessage
) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String errorMessage) {
        return new ApiResponse<>(false, null, errorCode, errorMessage);
    }
}
