import { useState, useEffect, useCallback } from 'react';

export interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  type: string;
  status: { id: number; label: string };
  recruitmentStatus: { id: number; label: string };
  categoryId: number;
  creatorId: number;
  creatorName: string;
  createdAt: string;
  hasSession: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  hasDiscount: boolean;
  originalPrice: number | null;
  primaryLocation: string | null;
  isOnline: boolean;
  startDate?: string;
  recruitStartDate?: string;  // 모집 시작일
  recruitEndDate?: string;    // 모집 마감일
}

export const isOnlineOptions = [
  { value: 'all', label: '온/오프라인: 전체' },
  { value: 'true', label: '온라인' },
  { value: 'false', label: '오프라인' }
];

export const recruitmentOptions = [
  { value: 'all', label: '모집상태: 전체' },
  { value: '1', label: '모집예정' },
  { value: '2', label: '모집중' },
  { value: '3', label: '모집마감' }
];

export const eventStatusOptions = [
  { value: 'all', label: '진행상태: 전체' },
  { value: '2', label: '진행예정' },
  { value: '3', label: '진행중' },
  { value: '4', label: '종료됨' }
];

export function useHome() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeIsOnline, setActiveIsOnline] = useState('all');
  const [activeRecruitmentStatus, setActiveRecruitmentStatus] = useState('all');
  const [activeEventStatus, setActiveEventStatus] = useState('all');

  const [categoryOptions, setCategoryOptions] = useState<{ value: string, label: string }[]>([
    { value: 'all', label: '카테고리: 전체' }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const resData = await res.json();
        if (resData.success && resData.data) {
          const opts = resData.data.map((c: any) => ({
            value: String(c.id),
            label: c.name
          }));
          setCategoryOptions([{ value: 'all', label: '카테고리: 전체' }, ...opts]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchEvents = useCallback(async (
    page: number,
    keyword: string = '',
    categoryId: string = 'all',
    isOnline: string = 'all',
    recruitmentStatusId: string = 'all',
    eventStatusId: string = 'all'
  ) => {
    setLoading(true);
    try {
      // Backend pagination is 0-indexed, UI is 1-indexed
      let url = `/api/events?page=${page - 1}&size=12&sort=latest`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }
      if (categoryId !== 'all') {
        url += `&categoryId=${categoryId}`;
      }
      if (isOnline !== 'all') {
        url += `&isOnline=${isOnline}`;
      }
      if (recruitmentStatusId !== 'all') {
        url += `&recruitmentStatusId=${recruitmentStatusId}`;
      }
      if (eventStatusId !== 'all') {
        url += `&eventStatusId=${eventStatusId}`;
      }

      const res = await fetch(url);
      const resData = await res.json();

      if (resData.success) {
        setEvents(resData.data.content);
        setTotalPages(resData.data.totalPages);

        // Wishlist도 동시에 조회 (비로그인이거나 에러시 조용히 넘어감)
        try {
          const wlRes = await fetch('/api/wishlists/me?size=100');
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            if (wlData.data && wlData.data.content) {
              const ids = new Set<number>(wlData.data.content.map((item: any) => item.id));
              setWishlistSet(ids);
            }
          }
        } catch (e) {
          // ignore error (e.g. not logged in)
        }
      } else {
        console.error('Failed to fetch events:', resData.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentPage, searchQuery, activeCategory, activeIsOnline, activeRecruitmentStatus, activeEventStatus);
  }, [currentPage, activeCategory, activeIsOnline, activeRecruitmentStatus, activeEventStatus, fetchEvents]);

  // Handle Search Submit
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchEvents(1, searchQuery, activeCategory, activeIsOnline, activeRecruitmentStatus, activeEventStatus);
    }
  };

  return {
    events,
    wishlistSet,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeIsOnline,
    setActiveIsOnline,
    activeRecruitmentStatus,
    setActiveRecruitmentStatus,
    activeEventStatus,
    setActiveEventStatus,
    categoryOptions,
    handleSearch,
  };
}
