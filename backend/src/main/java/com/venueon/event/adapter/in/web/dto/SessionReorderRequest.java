package com.venueon.event.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SessionReorderRequest(
    @NotNull(message = "세션 ID 목록은 필수입니다.") List<Long> sessionIds
) {}
