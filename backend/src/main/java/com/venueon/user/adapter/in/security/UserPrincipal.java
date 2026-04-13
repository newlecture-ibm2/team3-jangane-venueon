package com.venueon.user.adapter.in.security;

import com.venueon.user.domain.model.UserRole;
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
    private final UserRole role;

    public UserPrincipal(Long id, String email, String password, UserRole role) {
        super(email != null && !email.isBlank() ? email : "anonymous", 
              password != null ? password : "", 
              List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role.name() : UserRole.USER.name()))));
        this.id = id;
        this.role = role != null ? role : UserRole.USER;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean isHost() {
        return role == UserRole.HOST;
    }
}
