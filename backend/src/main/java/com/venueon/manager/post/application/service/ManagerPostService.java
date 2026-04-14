package com.venueon.manager.post.application.service;

import com.venueon.manager.post.application.port.in.PostManagerUseCase;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.member.application.port.out.MemberRepositoryPort;
import com.venueon.member.domain.model.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manager Actor 전용 Post 관리 Service.
 * 커뮤니티 매니저가 해당 커뮤니티 내 게시글을 관리합니다.
 * Core 도메인의 PostRepositoryPort를 주입받아 사용합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ManagerPostService implements PostManagerUseCase {

    private final PostRepositoryPort postRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final MemberRepositoryPort memberRepositoryPort;

    private void validateManagerOrAdmin(Long communityId, String email) {
        User requester = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        if (requester.isAdmin()) return;

        boolean isManager = memberRepositoryPort.findByCommunityIdAndUserId(communityId, requester.getId())
                .map(Member::isManager)
                .orElse(false);

        if (!isManager) {
            throw new IllegalArgumentException("Permission denied: only managers or system admins can perform this action.");
        }
    }

    @Override
    public void togglePin(Long postId, String email) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        
        validateManagerOrAdmin(post.getCommunityId(), email);
        
        post.togglePin();
        postRepositoryPort.save(post);
    }

    @Override
    public void toggleNotice(Long postId, String email) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        validateManagerOrAdmin(post.getCommunityId(), email);

        post.toggleNotice();
        postRepositoryPort.save(post);
    }

    @Override
    public void hidePost(Long postId, String email) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        validateManagerOrAdmin(post.getCommunityId(), email);

        post.hide();
        postRepositoryPort.save(post);
    }

    @Override
    public void deletePost(Long postId, String email) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        validateManagerOrAdmin(post.getCommunityId(), email);

        postRepositoryPort.delete(postId);
    }
}
