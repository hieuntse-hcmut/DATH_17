package com.smartcampus.backend.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UnreadCountResponse(@Schema(example = "3") long unread) {
}
