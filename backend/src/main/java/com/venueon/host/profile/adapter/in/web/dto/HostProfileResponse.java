package com.venueon.host.profile.adapter.in.web.dto;

import com.venueon.user.domain.model.HostProfile;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 호스트 프로필 조회 응답 DTO
 */
@Getter
@AllArgsConstructor
public class HostProfileResponse {

    private Long id;
    private Long userId;
    private String orgName;
    private String orgNumber;
    private String managerName;
    private String orgDescription;
    private String profileImg;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 도메인 모델 + User의 profileImg → 응답 DTO 변환
     */
    public static HostProfileResponse from(HostProfile profile, String profileImg) {
        return new HostProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getOrgName(),
                profile.getOrgNumber(),
                profile.getManagerName(),
                profile.getOrgDescription(),
                profileImg,
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
