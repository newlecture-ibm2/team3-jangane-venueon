package com.venueon.comment.application.port.out;

import com.venueon.comment.domain.model.Comment;
import java.util.List;
import java.util.Optional;

/**
 * 댓글 영속성 인터페이스 (Outbound Port)
 */
public interface CommentRepositoryPort {
    Comment save(Comment comment);
    Optional<Comment> findById(Long id);
    List<Comment> findByPostId(Long postId);
    long countByPostId(Long postId);

    boolean existsLike(Long commentId, Long userId);
    void saveLike(Long commentId, Long userId);
    void deleteLike(Long commentId, Long userId);

    boolean existsById(Long id);
    void deleteById(Long id);
}
