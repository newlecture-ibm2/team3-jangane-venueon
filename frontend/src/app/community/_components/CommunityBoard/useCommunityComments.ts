import React, { useState, useEffect, useMemo } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { CommentResponse } from './types';

interface UseCommunityCommentsProps {
  selectedPostId: number | null;
}

export function useCommunityComments({ selectedPostId }: UseCommunityCommentsProps) {
  const { showToast } = useUIStore();

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentValue, setEditingCommentValue] = useState('');

  const fetchComments = async (postId: number, silent = false) => {
    if (!silent) setIsCommentsLoading(true);
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) throw new Error('댓글을 불러오는데 실패했습니다.');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setIsCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (value: string, parentId: number | null = null) => {
    if (!selectedPostId || isCommentSubmitting) return;

    setIsCommentSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostId,
          content: value,
          parentId: parentId
        }),
      });

      if (!response.ok) throw new Error('댓글 등록 실패');

      showToast('댓글 등록 완료', 'success');
      setReplyToCommentId(null);
      fetchComments(selectedPostId, true);
    } catch (error) {
      console.error(error);
      showToast('댓글 등록 실패', 'error', '서버 오류가 발생했습니다.');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('삭제 실패');

      showToast('댓글이 삭제되었습니다.', 'success');
      if (selectedPostId) fetchComments(selectedPostId, true);
    } catch (error) {
      console.error(error);
      showToast('삭제 실패', 'error');
    }
  };

  const handleCommentEdit = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    setEditingCommentId(commentId);
    setEditingCommentValue(comment.content);
  };

  const handleCommentUpdateSubmit = async () => {
    if (!editingCommentId || !editingCommentValue.trim()) return;

    try {
      const response = await fetch(`/api/comments/${editingCommentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingCommentValue }),
      });

      if (!response.ok) throw new Error('수정 실패');

      showToast('댓글이 수정되었습니다.', 'success');
      setEditingCommentId(null);
      setEditingCommentValue('');
      if (selectedPostId) fetchComments(selectedPostId, true);
    } catch (error) {
      console.error(error);
      showToast('수정 실패', 'error');
    }
  };

  const handleCommentLikeToggle = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.status === 401) {
        showToast('로그인이 필요합니다.', 'error');
        return;
      }

      if (!response.ok) throw new Error('댓글 좋아요 실패');

      if (selectedPostId) {
        fetchComments(selectedPostId, true);
      }
    } catch (error) {
      console.error(error);
      showToast('좋아요 처리 실패', 'error');
    }
  };

  useEffect(() => {
    if (selectedPostId) {
      fetchComments(selectedPostId);
    }
  }, [selectedPostId]);

  const organizedComments = useMemo(() => {
    const roots = comments.filter(c => !c.parentId);
    const result: { comment: CommentResponse; level: number }[] = [];

    roots.forEach(root => {
      result.push({ comment: root, level: 0 });
      const children = comments.filter(c => c.parentId === root.id);
      children.forEach(child => {
        result.push({ comment: child, level: 1 });
      });
    });

    return result;
  }, [comments]);

  return {
    comments,
    isCommentsLoading,
    isCommentSubmitting,
    replyToCommentId,
    setReplyToCommentId,
    editingCommentId,
    setEditingCommentId,
    editingCommentValue,
    setEditingCommentValue,
    handleCommentSubmit,
    handleCommentDelete,
    handleCommentEdit,
    handleCommentUpdateSubmit,
    handleCommentLikeToggle,
    organizedComments
  };
}
