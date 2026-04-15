package com.venueon.comment.application.service;


import com.venueon.comment.application.port.in.CommentLikeUseCase;
import com.venueon.comment.application.port.in.CreateCommentUseCase;
import com.venueon.comment.application.port.in.DeleteCommentUseCase;
import com.venueon.comment.application.port.in.UpdateCommentUseCase;
import com.venueon.comment.application.port.in.dto.CommentResponse;
import com.venueon.comment.application.port.in.dto.CreateCommentRequest;
import com.venueon.comment.application.port.in.dto.UpdateCommentRequest;
import com.venueon.comment.application.port.out.CommentRepositoryPort;
import com.venueon.comment.domain.model.Comment;
import com.venueon.user.application.port.out.UserRepositoryPort;
import com.venueon.user.domain.model.User;
import com.venueon.post.application.port.out.PostRepositoryPort;
import com.venueon.post.domain.model.Post;
import com.venueon.community.application.service.CommunityPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import com.venueon.common.annotation.UseCase;

@UseCase
@RequiredArgsConstructor
@Transactional
public class CommentCommandService
        implements CreateCommentUseCase, CommentLikeUseCase, UpdateCommentUseCase, DeleteCommentUseCase {

    private final CommentRepositoryPort commentRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final PostRepositoryPort postRepositoryPort;
    private final CommunityPermissionService communityPermissionService;

    @Override
    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, String email) {
        User author = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // 커뮤니티 권한 체크 (CommunityPermissionService 활용)
        Post post = postRepositoryPort.findById(request.postId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + request.postId()));

        if (!communityPermissionService.canWrite(post.getCommunityId(), author)) {
            throw new IllegalArgumentException("Permission denied: You do not have permission to comment in this community.");
        }

        Comment comment = Comment.builder()
                .postId(request.postId())
                .authorId(author.getId())
                .parentId(request.parentId())
                .content(request.content())
                .build();

        Comment saved = commentRepositoryPort.save(comment);

        return new CommentResponse(
                saved.getId(),
                saved.getPostId(),
                saved.getAuthorId(),
                saved.getAuthorNickname(),
                saved.getContent(),
                saved.getParentId(),
                saved.getLikeCount(),
                saved.getCreatedAt());
    }

    @Override
    public void toggleLike(Long commentId, String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Comment comment = commentRepositoryPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + commentId));

        if (commentRepositoryPort.existsLike(commentId, user.getId())) {
            commentRepositoryPort.deleteLike(commentId, user.getId());
            comment.decrementLikeCount();
        } else {
            commentRepositoryPort.saveLike(commentId, user.getId());
            comment.incrementLikeCount();
        }

        commentRepositoryPort.save(comment);
    }

    @Override
    public void updateComment(Long id, UpdateCommentRequest request, String email) {
        User requester = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Comment comment = commentRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));

        // 권한 체크: 작성자 본인만 수정 가능
        if (!comment.getAuthorId().equals(requester.getId())) {
            throw new IllegalArgumentException("Permission denied: only the author can update the comment.");
        }

        comment.update(request.content());
        commentRepositoryPort.save(comment);
    }



    @Override
    public void deleteComment(Long id, String email) {
        User requester = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Comment comment = commentRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));

        // 권한 체크: 작성자 본인이거나 시스템 어드민만 삭제 가능
        if (!comment.getAuthorId().equals(requester.getId()) && !requester.isAdmin()) {
            throw new IllegalArgumentException("Permission denied: only the author or system admin can delete the comment.");
        }
        
        commentRepositoryPort.delete(id);
    }
}
