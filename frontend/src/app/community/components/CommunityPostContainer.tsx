'use client';

import React, { useState, useEffect } from 'react';
import { Pagination, InputField, UserProfile, CommentInput, Button } from '@/components/ui';
import CommunityPostItem from '@/app/community/components/CommunityPostItem';
import CommunityCommentItem from '@/app/community/components/CommunityCommentItem';
import { useUIStore } from '@/store/useUIStore';
import styles from './CommunityPostContainer.module.css';

interface PostListResponse {
  id: number;
  title: string;
  type: string;
  authorNickname: string;
  viewCount: number;
  commentCount: number;
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
}

export default function CommunityPostContainer({ communityId }: Props) {
  const { showToast } = useUIStore();
  const [posts, setPosts] = useState<PostListResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts?communityId=${communityId}&page=${currentPage - 1}&size=10`
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
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId, currentPage]);

  const selectedPost = posts.find(p => p.id === selectedPostId) || null;

  return (
    <div className={styles.container}>
      
      {/* 1. 좌측: 리스트 영역 (너비 고정) */}
      <div className={styles.leftSidebar}>
        <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
                <InputField variant="search" placeholder="검색어를 입력하세요" />
            </div>
            <Button variant="primary" onClick={() => window.location.href = `/community/${communityId}/write`}>
                글쓰기
            </Button>
        </div>

        <div className={styles.postList}>
          {isLoading ? (
              <div className={styles.loadingOrEmpty}>
                  데이터를 불러오는 중입니다...
              </div>
          ) : posts.length === 0 ? (
              <div className={styles.loadingOrEmpty}>
                  게시글이 없습니다.
              </div>
          ) : (
            posts.map(post => (
              <CommunityPostItem
                key={post.id}
                title={post.title}
                username={post.authorNickname}
                date={new Date(post.createdAt).toLocaleDateString() + ' / ' + new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                selected={post.id === selectedPostId}
                onClick={() => setSelectedPostId(post.id)}
              />
            ))
          )}
        </div>

        {/* 좌측 리스트 페이징 영역 */}
        {totalPages > 1 && (
          <div className={styles.paginationWrapper}>
             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* 2. 우측: 디테일 영역 (나머지 공간 전부 차지) */}
      <div className={styles.rightDetail}>
          {selectedPost ? (
              <>
                {/* 2-1. 상세 상단 헤더 */}
                <div className={styles.detailHeader}>
                    <div>
                        <h2 className={styles.detailTitle}>
                            {selectedPost.title}
                        </h2>
                        <div className={styles.detailMeta}>
                            <span>{new Date(selectedPost.createdAt).toLocaleDateString()} / {new Date(selectedPost.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    {/* 옵션 버튼 (점 3개 아이콘 더미) */}
                    <button className={styles.optionButton}>
                        •••
                    </button>
                </div>

                {/* 2-2. 작성자 및 본문 영역 */}
                <div className={styles.bodySection}>
                    <div className={styles.authorWrapper}>
                        <UserProfile name={selectedPost.authorNickname} size="medium" />
                    </div>
                    <div className={styles.contentWrapper}>
                        {/* 더미 내용 (나중에 4단계 상세조회 API 구현 시 대체될 예정!) */}
                        안녕하세요! 이번 마케팅 전략 세미나 듣고 실무에 바로 적용해봤습니다.<br/><br/>
                        작업 시간이 훨씬 단축되는 걸 체험했어요. 다만 보이스를 유지하면서 페르소나를 세밀하게 설정하는 단계에서 프롬프트가 조금 어렵게 느껴지네요.<br/><br/>
                        혹시 다른 분들은 챗GPT 외에 이미지 생성용으로 다른 툴 중 어떤 걸 더 선호하시나요? 궁금합니다! 다들 열공하세요.
                    </div>
                </div>

                {/* 2-3. 댓글 입력 영역 */}
                <div className={styles.commentInputWrapper}>
                   <CommentInput onSubmit={() => showToast('댓글 등록 준비중', 'success')} />
                </div>

                {/* 2-4. 댓글 리스트 영역 (더미 데이터) */}
                <div className={styles.commentList}>
                     <CommunityCommentItem
                        username="디자인킴"
                        date="2026.03.30 / 10:45"
                        content="저도 프롬프트 지니 쓰다가 최근에는 클로드로 넘어왔는데, 마케팅 문구는 클로드가 훨씬 자연스러운 것 같아요!"
                        menuItems={[{ value: 'report', label: '신고하기' }]}
                     />
                     <CommunityCommentItem
                        username="데이터분석가"
                        date="2026.03.30 / 10:55"
                        content="프롬프트 고도화 관련해서는 강사님이 지난주에 올려주신 보충 자료 영상 보시면 완전 도움 될 거예요!"
                        menuItems={[{ value: 'report', label: '신고하기' }]}
                     />
                </div>
              </>
          ) : (
              <div className={styles.emptyDetail}>
                  선택된 게시물이 없습니다.
              </div>
          )}
      </div>

    </div>
  );
}
