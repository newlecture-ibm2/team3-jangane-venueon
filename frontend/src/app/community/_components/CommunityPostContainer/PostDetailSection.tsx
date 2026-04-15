import React, { useState } from 'react';
import { UserProfile, CommentInput, PopoverMenu } from '@/components/ui';
import { MoreIcon } from '@/components/icons';
import { ReportModal } from '@/components/modal';
import CommunityCommentItem from '../CommunityCommentItem';
import { PostListResponse, CommentResponse } from './types';
import styles from './CommunityPostContainer.module.css';
import { useAuth } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

interface PostDetailSectionProps {
  selectedPost: PostListResponse | null;
  organizedComments: { comment: CommentResponse; level: number }[];
  isCommentsLoading: boolean;
  isCommentSubmitting: boolean;
  isLikeSubmitting: boolean;
  replyToCommentId: number | null;
  setReplyToCommentId: (id: number | null) => void;
  editingCommentId: number | null;
  editingCommentValue: string;
  onEditingValueChange: (value: string) => void;
  onCommentSubmit: (value: string, parentId?: number | null) => void;
  onCommentDelete: (id: number) => void;
  onCommentEdit: (id: number) => void;
  onCommentUpdate: () => void;
  onCommentLike: (id: number) => void;
  onPostLike: () => void;
  onPostBookmark: () => void;
  onPostPin: () => void;
  onPostNotice: () => void;
  onPostDelete: (id: number) => void;
  onPostEdit: (id: number) => void;
  canManage: boolean;
  canWrite: boolean;
  isLoggedIn: boolean;
}

export const PostDetailSection = ({
  selectedPost,
  organizedComments,
  isCommentsLoading,
  isCommentSubmitting,
  isLikeSubmitting,
  replyToCommentId,
  setReplyToCommentId,
  editingCommentId,
  editingCommentValue,
  onEditingValueChange,
  onCommentSubmit,
  onCommentDelete,
  onCommentEdit,
  onCommentUpdate,
  onCommentLike,
  onPostLike,
  onPostBookmark,
  onPostPin,
  onPostNotice,
  onPostDelete,
  onPostEdit,
  canManage,
  canWrite,
  isLoggedIn
}: PostDetailSectionProps) => {
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'POST' | 'COMMENT', id: number }>({ type: 'POST', id: 0 });

  const handleOpenReport = (type: 'POST' | 'COMMENT', id: number) => {
    setReportTarget({ type, id });
    setIsReportModalOpen(true);
  };

  const postTypeToKorean = (type: string) => {
    switch (type) {
      case 'NOTICE': return '공지';
      case 'FREE': return '자유';
      case 'QUESTION': return '질문';
      case 'INFO': return '정보';
      default: return '일반';
    }
  };

  if (!selectedPost) {
    return <div className={styles.rightDetail}><div className={styles.emptyDetail}>선택된 게시물이 없습니다.</div></div>;
  }

  return (
    <div className={styles.rightDetail}>
      <div className={styles.detailHeader}>
        <div>
          <h2 className={styles.detailTitle}>
            <span className={styles.detailPostType}>[{postTypeToKorean(selectedPost.type)}]</span> {selectedPost.title}
          </h2>
          <div className={styles.detailMeta}>
            <UserProfile name={selectedPost.authorNickname} size="medium" />
            <span className={styles.divider}>|</span>
            <span>{new Date(selectedPost.createdAt).toLocaleDateString()} / {new Date(selectedPost.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className={styles.detailActions}>
          <button className={styles.likeButton} onClick={onPostLike} disabled={isLikeSubmitting}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={selectedPost.likeCount > 0 ? "#EF4444" : "none"} stroke={selectedPost.likeCount > 0 ? "#EF4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>{selectedPost.likeCount}</span>
          </button>
          <button className={styles.bookmarkButton} onClick={onPostBookmark} title="북마크" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={selectedPost.isBookmarked ? "#F59E0B" : "none"} stroke={selectedPost.isBookmarked ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
          {canManage && (
            <>
              <button className={`${styles.adminButton} ${selectedPost.isPinned ? styles.active : ''}`} onClick={onPostPin} title={selectedPost.isNotice ? "공지사항은 고정 해제가 불가능합니다" : "상단 고정"} disabled={selectedPost.isNotice}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.79-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.79.9A2 2 0 0 0 5 15.24Z" />
                </svg>
              </button>
              <button className={`${styles.adminButton} ${selectedPost.isNotice ? styles.noticeActive : ''}`} onClick={onPostNotice} title="공지 설정">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
              </button>
            </>
          )}
          <div className={styles.optionButtonWrapper}>
            <button className={styles.optionButton} type="button" onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}>
              <MoreIcon />
            </button>
            {isPostMenuOpen && (
              <PopoverMenu
                items={[
                  { value: 'report', label: '신고하기' },
                  ...(user?.id === selectedPost.authorId ? [
                    { value: 'edit', label: '수정하기' },
                    { value: 'delete', label: '삭제하기' }
                  ] : [])
                ]}
                onSelect={(value) => {
                  if (value === 'report') {
                    handleOpenReport('POST', selectedPost.id);
                  } else if (value === 'edit') {
                    onPostEdit(selectedPost.id);
                  } else if (value === 'delete') {
                    onPostDelete(selectedPost.id);
                  }
                  setIsPostMenuOpen(false);
                }}
                onClose={() => setIsPostMenuOpen(false)}
                width={120}
                style={{ top: '100%', right: 0, marginTop: '4px' }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.bodySection}>
        <div className={styles.contentWrapper}>
          {selectedPost.content && (
            <div
              className={styles.richContent}
              dangerouslySetInnerHTML={{ 
                __html: selectedPost.content.includes('<') && selectedPost.content.includes('>') 
                  ? selectedPost.content 
                  : selectedPost.content.replace(/\n/g, '<br />')
              }}
            />
          )}
        </div>
      </div>

      <div className={styles.commentInputWrapper}>
        <CommentInput
          onSubmit={(v) => onCommentSubmit(v)}
          disabled={!isLoggedIn || isCommentSubmitting || !canWrite}
          placeholder={!isLoggedIn ? "로그인 후 댓글을 작성할 수 있습니다." : (!canWrite ? "이벤트 수료자만 댓글을 작성할 수 있습니다." : (isCommentSubmitting ? "등록 중..." : "댓글을 입력하세요.."))}
        />
      </div>

      <div className={styles.commentList}>
        {isCommentsLoading && organizedComments.length === 0 ? (
          <div className={styles.commentStatus}>댓글을 불러오는 중...</div>
        ) : organizedComments.length === 0 ? (
          <div className={styles.commentStatus}>첫 번째 댓글을 남겨보세요!</div>
        ) : (
          organizedComments.map(({ comment, level }) => (
            <React.Fragment key={comment.id}>
              <CommunityCommentItem
                username={comment.authorNickname}
                date={new Date(comment.createdAt).toLocaleDateString() + ' / ' + new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                content={comment.content}
                likeCount={comment.likeCount}
                onLike={() => onCommentLike(comment.id)}
                onReply={() => {
                  if (!isLoggedIn) {
                    showToast('로그인이 필요합니다.', 'error');
                    return;
                  }
                  setReplyToCommentId(comment.id);
                }}
                level={level}
                isEditing={editingCommentId === comment.id}
                editingValue={editingCommentValue}
                onEditingValueChange={onEditingValueChange}
                onSave={onCommentUpdate}
                onCancel={() => {
                  onEditingValueChange('');
                }}
                menuItems={[
                  { value: 'report', label: '신고하기' },
                  ...(user?.id === comment.authorId ? [
                    { value: 'edit', label: '수정하기' },
                    { value: 'delete', label: '삭제하기' }
                  ] : [])
                ]}
                onMenuSelect={(value) => {
                  if (value === 'report') {
                    handleOpenReport('COMMENT', comment.id);
                  } else if (value === 'edit') {
                    onCommentEdit(comment.id);
                  } else if (value === 'delete') {
                    onCommentDelete(comment.id);
                  }
                }}
              />
              {replyToCommentId === comment.id && (
                <div className={styles.inlineReplyInput} style={{ marginLeft: '48px' }}>
                  <div className={styles.replyLine} />
                  <div className={styles.replyToLabel}>
                    <span>답글 작성 중</span>
                    <button onClick={() => setReplyToCommentId(null)}>취소</button>
                  </div>
                  <CommentInput
                    onSubmit={(v) => onCommentSubmit(v, comment.id)}
                    placeholder="답글을 입력하세요..."
                    disabled={isCommentSubmitting}
                  />
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
      />
    </div>
  );
};
