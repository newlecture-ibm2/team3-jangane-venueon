package com.venueon.manager.post.application.service;

import com.venueon.manager.post.application.port.in.PostManagerUseCase;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
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

    @Override
    public void togglePin(Long postId) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        post.togglePin();
        postRepositoryPort.save(post);
    }

    @Override
    public void toggleNotice(Long postId) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        post.toggleNotice();
        postRepositoryPort.save(post);
    }

    @Override
    public void hidePost(Long postId) {
        Post post = postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        post.hide();
        postRepositoryPort.save(post);
    }

    @Override
    public void deletePost(Long postId) {
        postRepositoryPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        postRepositoryPort.delete(postId);
    }
}
