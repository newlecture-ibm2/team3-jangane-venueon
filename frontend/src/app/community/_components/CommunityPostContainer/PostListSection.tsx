import React from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, InputField, Button } from '@/components/ui';
import CommunityPostItem from '../CommunityPostItem';
import { PostListResponse } from './types';
import styles from './CommunityPostContainer.module.css';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';

interface PostListSectionProps {
  communityId: string;
  posts: PostListResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectedPostId: number | null;
  onPostSelect: (postId: number) => void;
  canWrite: boolean;
}

export const PostListSection = ({
  communityId,
  posts,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  searchInput,
  onSearchInputChange,
  onSearch,
  onKeyDown,
  selectedPostId,
  onPostSelect,
  canWrite
}: PostListSectionProps) => {
  const router = useRouter();
  const { showToast } = useUIStore();
  const { isLoggedIn } = useAuth();

  return (
    <div className={styles.leftSidebar}>
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <InputField 
            variant="search" 
            placeholder="게시글 검색 (제목, 내용, 작성자)" 
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <Button 
          variant="primary" 
          onClick={onSearch}
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
              onClick={() => onPostSelect(post.id)}
              isPinned={post.isPinned}
              isNotice={post.isNotice}
              type={post.type}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};
