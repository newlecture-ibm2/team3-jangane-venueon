package com.venueon.common.model;

public record DomainCode(Long id, String label) {
    public static DomainCode of(Long id, String label) {
        if (id == null) return null;
        return new DomainCode(id, label);
    }
}
