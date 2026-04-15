'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, InputField, UserProfile, CommentInput, Button } from '@/components/ui';
import CommunityPostItem from '@/app/community/components/CommunityPostItem';
import CommunityCommentItem from '@/app/community/components/CommunityCommentItem';
import { useUIStore } from '@/store/useUIStore';
import styles from './CommunityPostContainer.module.css';
import { ReportModal } from '@/components/modal';
import { PopoverMenu } from '@/components/ui';
import { MoreIcon } from '@/components/icons';
import { useAuth } from '@/store/useAuthStore';

interface PostListResponse {
  id: number;
  title: string;
  type: string;
  authorId: number;
  authorNickname: string;
  content: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isBookmarked: boolean;
  isPinned: boolean;
  isNotice: boolean;
  createdAt: string;
}

interface CommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  parentId: number | null;
  likeCount: number;
  createdAt: string;
}

interface PageData {
  content: PostListResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
}

interface Props {
  communityId: string;
  canManage: boolean;
  canWrite: boolean;
}

export default function CommunityPostContainer({ communityId, canManage, canWrite }: Props) {
  const router = useRouter();
  const { showToast } = useUIStore();
  const { user, isLoggedIn } = useAuth();

  const [posts, setPosts] = useState<PostListResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);

  // 댓글 수정/신고 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentValue, setEditingCommentValue] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'POST' | 'COMMENT', id: number }>({ type: 'POST', id: 0 });

  const handleOpenReport = (type: 'POST' | 'COMMENT', id: number) => {
    setReportTarget({ type, id });
    setIsReportModalOpen(true);
  };

  const fetchPosts = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts?communityId=${communityId}&page=${currentPage - 1}&size=10${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`
      );

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const data: PageData = await response.json();
      setPosts(data.content);
      setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);

      if (data.content.length > 0 && selectedPostId === null) {
        setSelectedPostId(data.content[0].id);
      }
    } catch (error) {
      console.error(error);
      showToast('게시물 불러오기 실패', 'error', '네트워크 오류가 발생했습니다.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

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

      setReplyToCommentId(null); // 전송 후 초기화
      fetchComments(selectedPostId, true); // 사일런트 업데이트 (깜빡임 방지)
    } catch (error) {
      console.error(error);
      showToast('댓글 등록 실패', 'error', '서버 오류가 발생했습니다.');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!selectedPostId || isLikeSubmitting) return;

    setIsLikeSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${selectedPostId}/like`, {
        method: 'POST',
      });

      if (response.status === 401) {
        showToast('로그인이 필요합니다.', 'error');
        return;
      }

      if (!response.ok) throw new Error('좋아요 처리 실패');

      fetchPosts(true);
    } catch (error) {
      console.error(error);
      showToast('좋아요 처리 실패', 'error');
    } finally {
      setIsLikeSubmitting(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!selectedPostId) return;

    try {
      const response = await fetch(`/api/posts/${selectedPostId}/bookmark`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('북마크 처리 실패');

      showToast('북마크 상태가 변경되었습니다.', 'success');
      fetchPosts(true);
    } catch (error) {
      console.error(error);
      showToast('북마크 처리 실패', 'error');
    }
  };

  const handlePinToggle = async () => {
    if (!selectedPostId) return;

    try {
      const response = await fetch(`/api/posts/${selectedPostId}/pin`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('고정 처리 실패');

      showToast('고정 상태가 변경되었습니다.', 'success');
      fetchPosts(true);
    } catch (error) {
      console.error(error);
      showToast('고정 처리 실패', 'error');
    }
  };

  const handleNoticeToggle = async () => {
    if (!selectedPostId) return;

    try {
      const response = await fetch(`/api/posts/${selectedPostId}/notice`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('공지 처리 실패');

      showToast('공지 상태가 변경되었습니다.', 'success');
      fetchPosts(true);
    } catch (error) {
      console.error(error);
      showToast('공지 처리 실패', 'error');
    }
  };

  const handlePostDelete = async (postId: number) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('삭제 실패');

      showToast('게시글이 삭제되었습니다.', 'success');
      setSelectedPostId(null);
      fetchPosts();
    } catch (error) {
      console.error(error);
      showToast('삭제 실패', 'error');
    }
  };

  const handlePostEdit = (postId: number) => {
    router.push(`/community/${communityId}/posts/${postId}/edit`);
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

  const handleSearch = () => {
    setKeyword(searchInput);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [communityId, currentPage, keyword]);

  useEffect(() => {
    if (selectedPostId) {
      fetchComments(selectedPostId);
    }
  }, [selectedPostId]);

  // 댓글 계층 구조화 로직 (5단계 핵심)
  const organizedComments = React.useMemo(() => {
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

  const postTypeToKorean = (type: string) => {
    switch (type) {
      case 'NOTICE': return '공지';
      case 'FREE': return '자유';
      case 'QUESTION': return '질문';
      case 'INFO': return '정보';
      default: return '일반';
    }
  };

  const selectedPost = posts.find(p => p.id === selectedPostId) || null;

  return (
    <div className={styles.container}>

      {/* 1. 좌측: 리스트 영역 */}
      <div className={styles.leftSidebar}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <InputField 
              variant="search" 
              placeholder="게시글 검색 (제목, 내용, 작성자)" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handleSearch}
            className={styles.searchButton}
          >
            검색
          </Button>
        </div>

        <div className={styles.writeRow}>
          <Button 
            variant="primary" 
            fullWidth
            onClick={() => {
              if (!isLoggedIn) {
                showToast('로그인이 필요합니다.', 'error');
                router.push('/login');
                return;
              }
              if (!canWrite) {
                showToast('권한이 없습니다.', 'error', '해당 이벤트를 수료한 사용자만 글을 작성할 수 있습니다.');
                return;
              }
              router.push(`/community/${communityId}/write`);
            }}
          >
            글쓰기
          </Button>
        </div>

        <div className={styles.postList}>

          {isLoading && posts.length === 0 ? (
            <div className={styles.loadingOrEmpty}>데이터를 불러오는 중입니다...</div>

          ) : posts.length === 0 ? (
            <div className={styles.loadingOrEmpty}>게시글이 없습니다.</div>
          ) : (
            posts.map(post => (
              <CommunityPostItem
                key={post.id}
                title={post.title}
                username={post.authorNickname}
                date={new Date(post.createdAt).toLocaleDateString() + ' / ' + new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                selected={post.id === selectedPostId}
                onClick={() => setSelectedPostId(post.id)}
                isPinned={post.isPinned}
                isNotice={post.isNotice}
                type={post.type}
              />
            ))
          )
          }
        </div >

        {totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )
        }
      </div >

      {/* 2. 우측: 디테일 영역 */}
      < div className={styles.rightDetail} >
        {
          selectedPost ? (
            <>
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
                  <button
                    className={styles.likeButton}
                    onClick={handleLikeToggle}
                    disabled={isLikeSubmitting}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={selectedPost.likeCount > 0 ? "#EF4444" : "none"}
                      stroke={selectedPost.likeCount > 0 ? "#EF4444" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span>{selectedPost.likeCount}</span>
                  </button>
                  <button
                    className={styles.bookmarkButton}
                    onClick={handleBookmarkToggle}
                    title="북마크"
                    type="button"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={selectedPost.isBookmarked ? "#F59E0B" : "none"}
                      stroke={selectedPost.isBookmarked ? "#F59E0B" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </button>
                  {canManage && (
                    <>
                      <button
                        className={`${styles.adminButton} ${selectedPost.isPinned ? styles.active : ''}`}
                        onClick={handlePinToggle}
                        title={selectedPost.isNotice ? "공지사항은 고정 해제가 불가능합니다" : "상단 고정"}
                        disabled={selectedPost.isNotice}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.79-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.79.9A2 2 0 0 0 5 15.24Z" />
                        </svg>
                      </button>
                      <button
                        className={`${styles.adminButton} ${selectedPost.isNotice ? styles.noticeActive : ''}`}
                        onClick={handleNoticeToggle}
                        title="공지 설정"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                        </svg>
                      </button>
                    </>
                  )}
                  <div className={styles.optionButtonWrapper}>
                    <button
                      className={styles.optionButton}
                      type="button"
                      onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}
                    >
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
                          if (value === 'report' && selectedPostId) {
                            handleOpenReport('POST', selectedPostId);
                          } else if (value === 'edit' && selectedPostId) {
                            handlePostEdit(selectedPostId);
                          } else if (value === 'delete' && selectedPostId) {
                            handlePostDelete(selectedPostId);
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
                  onSubmit={(v) => handleCommentSubmit(v)}
                  disabled={!isLoggedIn || isCommentSubmitting || !canWrite}
                  placeholder={!isLoggedIn ? "로그인 후 댓글을 작성할 수 있습니다." : (!canWrite ? "이벤트 수료자만 댓글을 작성할 수 있습니다." : (isCommentSubmitting ? "등록 중..." : "댓글을 입력하세요.."))}
                />
              </div>

              <div className={styles.commentList}>
                {isCommentsLoading && comments.length === 0 ? (
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
                        onLike={() => handleCommentLikeToggle(comment.id)}
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
                        onEditingValueChange={setEditingCommentValue}
                        onSave={handleCommentUpdateSubmit}
                        onCancel={() => {
                          setEditingCommentId(null);
                          setEditingCommentValue('');
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
                            handleCommentEdit(comment.id);
                          } else if (value === 'delete') {
                            handleCommentDelete(comment.id);
                          }
                        }}
                      />
                      {/* 답글 입력창: 현재 댓글이 답글 작성 대상이고 부모 댓글인 경우 바로 아래에 표시 */}
                      {replyToCommentId === comment.id && (
                        <div className={styles.inlineReplyInput} style={{ marginLeft: '48px' }}>
                          <div className={styles.replyLine} />
                          <div className={styles.replyToLabel}>
                            <span>답글 작성 중</span>
                            <button onClick={() => setReplyToCommentId(null)}>취소</button>
                          </div>
                          <CommentInput
                            onSubmit={(v) => handleCommentSubmit(v, comment.id)}
                            placeholder="답글을 입력하세요..."
                            disabled={isCommentSubmitting}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>

              {/* 신고 모달 */}
              <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetType={reportTarget.type}
                targetId={reportTarget.id}
              />
            </>
          ) : (
            <div className={styles.emptyDetail}>선택된 게시물이 없습니다.</div>
          )}
      </div >
    </div >
  );
}
