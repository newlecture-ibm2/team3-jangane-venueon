package com.venueon.common.config;

import com.venueon.user.adapter.in.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요 경로
                .requestMatchers("/auth/signup", "/auth/host/signup", "/auth/login", "/auth/google").permitAll()
                // Swagger UI
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                // Actuator
                .requestMatchers("/actuator/**").permitAll()
                // 정적 리소스
                .requestMatchers("/images/**", "/css/**", "/js/**", "/favicon.ico").permitAll()
                // /orders/toss/webhook — 토스 결제 웹훅 (인증 불필요)
                .requestMatchers("/orders/toss/webhook").permitAll()
                
                // 인증 필요 경로
                .requestMatchers("/auth/me").authenticated()
                .requestMatchers("/users", "/users/**").authenticated()
                .requestMatchers("/orders", "/orders/**").authenticated()
                .requestMatchers("/contacts", "/contacts/**").authenticated()
                
                // /admin/** — ADMIN 권한 필요
                .requestMatchers("/admin/**").hasRole("ADMIN")
                
                // /host/** — 인증 필요 (Host 전용)
                .requestMatchers("/host/**").authenticated()
                
                // 커뮤니티/게시글/댓글 수정 및 삭제 — 인증 필요
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/communities/**", "/posts/**", "/comments/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/communities/**", "/posts/**", "/comments/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/communities/**", "/posts/**", "/comments/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/communities/**", "/posts/**", "/comments/**").authenticated()

                // 리뷰 작성 — 인증 필요
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/events/*/reviews").authenticated()

                // 그 외 기존 경로는 일단 허용
                .anyRequest().permitAll()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                })
            )
            // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 등록
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
