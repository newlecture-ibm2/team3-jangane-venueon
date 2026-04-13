package com.venueon.common.dto;

public record CodeDto(Long id, String label) {
    public static CodeDto of(Long id, String label) {
        if (id == null) return null;
        return new CodeDto(id, label);
    }
}
