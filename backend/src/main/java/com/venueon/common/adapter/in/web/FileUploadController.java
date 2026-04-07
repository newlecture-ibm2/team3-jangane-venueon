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
 * POST /files/upload?category=lecture-thumbnail
 * → /upload/lecture-thumbnail/{uuid}.{ext} 로 저장
 */
@RestController
@RequestMapping("/files")
public class FileUploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "lecture-thumbnail") String category
    ) throws IOException {

        // 파일명 생성: UUID + 원본 확장자
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String savedFileName = UUID.randomUUID() + ext;

        // 카테고리별 하위 디렉토리 생성
        String resolved = uploadDir.startsWith("~")
                ? System.getProperty("user.home") + uploadDir.substring(1)
                : uploadDir;
        Path categoryDir = Paths.get(resolved).toAbsolutePath().normalize().resolve(category);
        Files.createDirectories(categoryDir);

        // 파일 저장
        Path targetPath = categoryDir.resolve(savedFileName);
        file.transferTo(targetPath.toFile());

        // 상대 경로 반환 (프론트에서 /upload/... 으로 접근)
        String relativePath = category + "/" + savedFileName;

        return ApiResponse.success(Map.of(
                "filePath", relativePath,
                "originalName", originalName != null ? originalName : savedFileName
        ));
    }
}
