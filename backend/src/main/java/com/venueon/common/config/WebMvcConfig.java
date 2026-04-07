package com.venueon.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * /upload/** 요청을 file.upload-dir 디렉토리의 정적 파일로 매핑합니다.
 * 예) GET /upload/test.png → {upload-dir}/test.png
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // ~ (틸다)를 실제 홈 디렉토리로 치환
        String resolved = uploadDir.startsWith("~")
                ? System.getProperty("user.home") + uploadDir.substring(1)
                : uploadDir;

        // 절대 경로로 정규화 + 끝에 / 보장
        Path absolutePath = Paths.get(resolved).toAbsolutePath().normalize();
        
        // 경로 끝에 / 추가
        String location = absolutePath.toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }

        registry.addResourceHandler("/upload/**")
                .addResourceLocations(location);
    }
}
