import { useState, useEffect, useCallback } from 'react';

export interface CommunityCardItem {
  id: number;
  postType: string;
  timeAgo: string;
  title: string;
  
  // Community Card fields
  organizer?: string;
  dateTime?: string;
  location?: string;
  
  // PostItem fields
  username?: string;
  date?: string;
  avatarUrl?: string;
  isPinned?: boolean;
  isNotice?: boolean;
}

const ITEMS_PER_PAGE = 8; // 그리드는 8개씩 노출

// 시간 포맷 변경 함수
function getTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}일 전`;
}

// 날짜 포맷 (예: 2026.03.30 / 10:35)
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} / ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function useCommunity() {
  const [activeTab, setActiveTab] = useState('participating');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [communityList, setCommunityList] = useState<CommunityCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCommunities = useCallback(async (tab: string, page: number) => {
    setIsLoading(true);

    if (tab === 'participating') {
      try {
        const res = await fetch(`/api/communities/me?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
        if (res.ok) {
          const json = await res.json();
          const content = json.content || [];
          setCommunityList(content);
          const total = json.totalPages || 1;
          setTotalPages(total === 0 ? 1 : total);
        } else {
          setCommunityList([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Failed to fetch my communities:', err);
        setCommunityList([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tab === 'post_bookmark') {
      try {
        const res = await fetch(`/api/posts/bookmarks/me?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
        if (res.ok) {
          const json = await res.json();
          // Backend 응답이 Page<PostListResponse> 이므로 배열은 content 에 들어옵니다.
          const content = json.content || json.data?.content || [];
          
          const mappedList: CommunityCardItem[] = content.map((post: any) => ({
            id: post.id,
            postType: post.type || "FREE", // PostType enum
            timeAgo: getTimeAgo(post.createdAt),
            title: post.title,
            username: post.authorNickname || "익명",
            date: formatDate(post.createdAt),
            avatarUrl: post.authorProfileImg,
            isPinned: post.isPinned,
            isNotice: post.isNotice,
          }));

          setCommunityList(mappedList);
          
          const total = json.totalPages || json.data?.totalPages || 1;
          setTotalPages(total);
        } else {
          setCommunityList([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Failed to fetch bookmarked posts:', err);
        setCommunityList([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCommunities(activeTab, currentPage);
  }, [activeTab, currentPage, fetchCommunities]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    activeTab,
    currentPage,
    totalPages,
    communityList,
    isLoading,
    handleTabChange,
    handlePageChange,
  };
}
