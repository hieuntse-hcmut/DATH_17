package com.smartcampus.backend.enrollment.exception;

import com.smartcampus.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** Business error of the Enrollment module (handled by common ApiExceptionHandler). */
public class EnrollmentException extends ApiException {

    public EnrollmentException(HttpStatus status, String code, String message) {
        super(status, code, message);
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
}
