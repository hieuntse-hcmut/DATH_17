package com.smartcampus.backend.enrollment.exception;

import org.springframework.http.HttpStatus;

public class EnrollmentException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public EnrollmentException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static EnrollmentException unauthorized(String message) {
        return new EnrollmentException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    public static EnrollmentException forbidden(String code, String message) {
        return new EnrollmentException(HttpStatus.FORBIDDEN, code, message);
    }

    public static EnrollmentException notFound(String code, String message) {
        return new EnrollmentException(HttpStatus.NOT_FOUND, code, message);
    }

    public static EnrollmentException badRequest(String code, String message) {
        return new EnrollmentException(HttpStatus.BAD_REQUEST, code, message);
    }

    public static EnrollmentException conflict(String code, String message) {
        return new EnrollmentException(HttpStatus.CONFLICT, code, message);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}