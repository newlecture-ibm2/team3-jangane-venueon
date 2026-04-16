import React from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, InputField, Button } from '@/components/ui';
import CommunityPostItem from '../../../CommunityPostItem';
import { useCommunityBoard } from '../../CommunityBoardContext';
import styles from './PostListSection.module.css';
import { useUIStore } from '@/store/useUIStore';

export const PostListSection = () => {
  const router = useRouter();
  const { showToast } = useUIStore();
  const { 
    communityId,
    posts, 
    isLoading, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    searchInput, 
    setSearchInput, 
    handleSearch, 
    handleKeyDown, 
    selectedPostId, 
    setSelectedPostId,
    canWrite,
    isLoggedIn
  } = useCommunityBoard();

  return (
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
          posts.map((post: any) => (
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
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
};
