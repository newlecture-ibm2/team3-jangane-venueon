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
                // /auth/me — 인증 필요
                .requestMatchers("/auth/me").authenticated()
                // /orders/toss/webhook — 토스 결제 웹훅 (인증 불필요)
                .requestMatchers("/orders/toss/webhook").permitAll()
                // /v1/users 및 하위 마이페이지/사용자 관련 API 인증 필요
                .requestMatchers("/v1/users", "/v1/users/**").authenticated()
                // /orders 및 하위 결제/주문 API 인증 필요
                .requestMatchers("/orders", "/orders/**").authenticated()
                // 그 외 기존 경로는 일단 허용 (점진적으로 보호 추가 예정)
                .anyRequest().permitAll()
            )
            // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 등록
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
