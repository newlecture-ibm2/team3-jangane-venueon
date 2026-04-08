package com.venueon.user.adapter.in.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * Custom UserDetails implementation to carry extra information like userId
 */
@Getter
public class CustomUserDetails extends User {
    private final Long userId;

    public CustomUserDetails(Long userId, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        super(email, password, authorities);
        this.userId = userId;
    }
}
