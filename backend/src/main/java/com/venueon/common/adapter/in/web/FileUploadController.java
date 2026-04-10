package com.venueon.common.adapter.in.web;

import com.venueon.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

/**
 * 공용 파일 업로드 API
 * POST /files/upload?category=event-thumbnail
 * → /upload/event-thumbnail/{yyyy}/{MM}/{uuid}.{ext} 로 저장
 *
 * 폴더 구조: 카테고리 1차 분류 + 연/월 2차 분류 + UUID 파일명
 * @see docs/이미지_업로드_관리_전략.md §2
 */
@RestController
@RequestMapping("/files")
public class FileUploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "event-thumbnail") String category
    ) throws IOException {

        // 카테고리 검증 (디렉토리 순회 방지)
        if (category.contains("..") || category.contains("/") || category.contains("\\")) {
            throw new IllegalArgumentException("잘못된 카테고리입니다: " + category);
        }

        // 파일명 생성: UUID + 원본 확장자
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String savedFileName = UUID.randomUUID() + ext;

        // 연/월 하위 폴더 생성
        java.time.LocalDate now = java.time.LocalDate.now();
        String yearMonth = now.getYear() + "/" + String.format("%02d", now.getMonthValue());

        // 카테고리/연/월 디렉토리 생성
        String resolved = uploadDir.startsWith("~")
                ? System.getProperty("user.home") + uploadDir.substring(1)
                : uploadDir;
        Path categoryDir = Paths.get(resolved).toAbsolutePath().normalize()
                .resolve(category)
                .resolve(yearMonth);
        Files.createDirectories(categoryDir);

        // 파일 저장
        Path targetPath = categoryDir.resolve(savedFileName);
        file.transferTo(targetPath.toFile());

        // 상대 경로 반환 (프론트에서 /upload/... 으로 접근)
        String relativePath = category + "/" + yearMonth + "/" + savedFileName;

        return ApiResponse.success(Map.of(
                "filePath", relativePath,
                "originalName", originalName != null ? originalName : savedFileName
        ));
    }
}
