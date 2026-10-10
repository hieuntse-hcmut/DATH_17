package com.smartcampus.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        T data,
        @JsonProperty("error_code") String errorCode,
        @JsonProperty("error_message") String errorMessage
) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String errorMessage) {
        return new ApiResponse<>(false, null, errorCode, errorMessage);
    }
}
