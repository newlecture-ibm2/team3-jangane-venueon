package com.venueon.user.adapter.in.security;

import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;

/**
 * Spring Security 인증 객체에 담을 커스텀 UserDetails
 * userId와 Role 정보를 포함하여 기능 권한 체크 시 DB 조회를 최소화함
 */
@Getter
public class UserPrincipal extends User {
    private final Long id;
    private final String role;

    public UserPrincipal(Long id, String email, String password, String role) {
        super(email != null && !email.isBlank() ? email : "anonymous", 
              password != null ? password : "", 
              List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER"))));
        this.id = id;
        this.role = role != null ? role : "USER";
    }

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isHost() {
        return "HOST".equals(role);
    }
}
