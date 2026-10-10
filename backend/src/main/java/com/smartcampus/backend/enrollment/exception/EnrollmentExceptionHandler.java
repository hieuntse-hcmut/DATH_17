package com.smartcampus.backend.enrollment.exception;

import com.smartcampus.backend.common.response.ApiResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.smartcampus.backend.enrollment")
public class EnrollmentExceptionHandler {

    @ExceptionHandler(EnrollmentException.class)
    public ResponseEntity<ApiResponse<Void>> handleEnrollmentException(EnrollmentException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }

    /** e.g. POST /api/courses/abc/enroll */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("INVALID_PARAMETER", "Invalid value for '" + ex.getName() + "'"));
    }
}
