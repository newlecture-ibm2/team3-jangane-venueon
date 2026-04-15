'use client';

import React from 'react';
import { useAuth } from '@/store/useAuthStore';
import { useCommunityPosts } from './useCommunityPosts';
import { useCommunityComments } from './useCommunityComments';
import { PostListSection } from './PostListSection';
import { PostDetailSection } from './PostDetailSection';
import styles from './CommunityPostContainer.module.css';

interface Props {
  communityId: string;
  canManage: boolean;
  canWrite: boolean;
}

export default function CommunityPostContainer({ communityId, canManage, canWrite }: Props) {
  const { isLoggedIn } = useAuth();
  
  const {
    posts,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchInput,
    setSearchInput,
    handleSearch,
    handleKeyDown,
    selectedPostId,
    setSelectedPostId,
    handleLikeToggle,
    handleBookmarkToggle,
    handlePinToggle,
    handleNoticeToggle,
    handlePostDelete,
    handlePostEdit,
    isLikeSubmitting
  } = useCommunityPosts({ communityId });

  const {
    isCommentsLoading,
    isCommentSubmitting,
    replyToCommentId,
    setReplyToCommentId,
    editingCommentId,
    editingCommentValue,
    setEditingCommentValue,
    handleCommentSubmit,
    handleCommentDelete,
    handleCommentEdit,
    handleCommentUpdateSubmit,
    handleCommentLikeToggle,
    organizedComments
  } = useCommunityComments({ selectedPostId });

  const selectedPost = posts.find(p => p.id === selectedPostId) || null;

  return (
    <div className={styles.container}>
      {/* 1. 좌측: 리스트 영역 */}
      <PostListSection
        communityId={communityId}
        posts={posts}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
        selectedPostId={selectedPostId}
        onPostSelect={setSelectedPostId}
        canWrite={canWrite}
      />

      {/* 2. 우측: 디테일 영역 */}
      <PostDetailSection
        selectedPost={selectedPost}
        organizedComments={organizedComments}
        isCommentsLoading={isCommentsLoading}
        isCommentSubmitting={isCommentSubmitting}
        isLikeSubmitting={isLikeSubmitting}
        replyToCommentId={replyToCommentId}
        setReplyToCommentId={setReplyToCommentId}
        editingCommentId={editingCommentId}
        editingCommentValue={editingCommentValue}
        onEditingValueChange={setEditingCommentValue}
        onCommentSubmit={handleCommentSubmit}
        onCommentDelete={handleCommentDelete}
        onCommentEdit={handleCommentEdit}
        onCommentUpdate={handleCommentUpdateSubmit}
        onCommentLike={handleCommentLikeToggle}
        onPostLike={handleLikeToggle}
        onPostBookmark={handleBookmarkToggle}
        onPostPin={handlePinToggle}
        onPostNotice={handleNoticeToggle}
        onPostDelete={handlePostDelete}
        onPostEdit={handlePostEdit}
        canManage={canManage}
        canWrite={canWrite}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
