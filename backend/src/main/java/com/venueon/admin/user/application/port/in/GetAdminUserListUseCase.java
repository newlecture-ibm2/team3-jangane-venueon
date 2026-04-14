package com.venueon.admin.user.application.port.in;

import com.venueon.user.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 관리자용 회원 목록 조회 UseCase
 */
public interface GetAdminUserListUseCase {

    /**
     * 회원 목록 조회 (검색 + 역할 필터 + 페이징)
     *
     * @param keyword  검색어 (이메일 또는 닉네임, null이면 전체)
     * @param role     역할 필터 (null이면 전체)
     * @param active   활성 여부 필터 (null이면 전체)
     * @param pageable 페이징 정보
     * @return 페이징된 회원 목록
     */
    Page<User> getUsers(String keyword, String role, Boolean active, Pageable pageable);
}
