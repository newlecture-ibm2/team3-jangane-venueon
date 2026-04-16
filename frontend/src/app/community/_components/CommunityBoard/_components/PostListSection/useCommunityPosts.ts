import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { PostListResponse, PageData } from '../../types';

interface UseCommunityPostsProps {
  communityId: string;
}

export function useCommunityPosts({ communityId }: UseCommunityPostsProps) {
  const router = useRouter();
  const { showToast } = useUIStore();

  const [posts, setPosts] = useState<PostListResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);

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

  const handleSearch = () => {
    setKeyword(searchInput);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId, currentPage, keyword]);

  return {
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
    isLikeSubmitting,
    fetchPosts
  };
}
