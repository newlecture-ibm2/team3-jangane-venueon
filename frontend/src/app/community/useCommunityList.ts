import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  creatorNickname: string;
  createdAt: string;
  canManage: boolean;
}

interface PageData {
  content: CommunityItem[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function useCommunityList() {
  const { showToast } = useUIStore();
  const { user, isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam === 'joined' ? 'joined' : 'all');
  const [hasBadges, setHasBadges] = useState(false);

  useEffect(() => {
    setActiveTab(tabParam === 'joined' ? 'joined' : 'all');
  }, [tabParam]);

  const checkBadges = async () => {
    if (!isLoggedIn || !user?.id) return;
    try {
      const response = await fetch('/api/badges/me');
      if (response.ok) {
        const result = await response.json();
        setHasBadges(result.data && result.data.length > 0);
      }
    } catch (e) {
      console.error('Failed to fetch badges:', e);
    }
  };

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'joined' ? '/api/communities/me' : '/api/communities';
      const response = await fetch(`${endpoint}?page=${currentPage - 1}&size=12`);
      if (!response.ok) throw new Error('커뮤니티 목록을 불러오는데 실패했습니다.');
      const data: PageData = await response.json();
      setCommunities(data.content);
      setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
    } catch (error) {
      console.error(error);
      showToast('커뮤니티 불러오기 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [currentPage, activeTab]);

  useEffect(() => {
    if (isLoggedIn) {
      checkBadges();
    }
  }, [isLoggedIn, user?.id]);

  return {
    communities,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    activeTab,
    hasBadges,
    isLoggedIn,
    user,
    showToast
  };
}
