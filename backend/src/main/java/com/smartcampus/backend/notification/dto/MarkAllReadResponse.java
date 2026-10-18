package com.smartcampus.backend.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record MarkAllReadResponse(@Schema(description = "How many notifications were marked as read", example = "3") int marked) {
}
