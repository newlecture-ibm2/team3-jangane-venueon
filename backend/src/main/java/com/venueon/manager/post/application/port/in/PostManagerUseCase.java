package com.venueon.manager.post.application.port.in;

/**
 * 커뮤니티 매니저 전용 게시글 관리 UseCase.
 * 커뮤니티 내 관리 권한을 가진 매니저가 사용합니다.
 */
public interface PostManagerUseCase {
    void togglePin(Long postId, String email);
    void toggleNotice(Long postId, String email);
    void hidePost(Long postId, String email);
    void deletePost(Long postId, String email);
}
