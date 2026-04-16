import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/admin-api';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  creatorNickname: string;
  eventName: string | null;
  createdAt: string;
  lastPostCreatedAt?: string;
}

export function useAdminCommunity() {
  const [allCommunities, setAllCommunities] = useState<CommunityItem[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<CommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const apiResponse = await api.get<ApiResponse<CommunityItem[]>>('/admin/community');
      if (apiResponse && apiResponse.success) {
        setAllCommunities(apiResponse.data);
      }
    } catch (error) {
      console.warn("API 호출 실패, 더미 데이터로 대체합니다.", error);
      const dummy = [
        { id: 1, name: '자유게시판', description: '누구나 자유롭게 이야기하는 공간', creatorNickname: '관리자', eventName: null, createdAt: new Date().toISOString() },
        { id: 2, name: '질문답변', description: '서로 돕고 배우는 공간', creatorNickname: '관리자', eventName: null, createdAt: new Date().toISOString() },
        { id: 3, name: 'Next.js 15 강의 커뮤니티', description: '강의 수강생 전용 공간입니다.', creatorNickname: '지식공유자', eventName: 'Next.js 15 마스터 클래스', createdAt: new Date().toISOString() }
      ];
      setAllCommunities(dummy);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let result = [...allCommunities];

    // 1) 탭 필터
    if (activeTab === 'GENERAL') {
      result = result.filter(c => !c.eventName);
    } else if (activeTab === 'EVENT') {
      result = result.filter(c => !!c.eventName);
    }

    // 2) 검색 필터
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        (c.description && c.description.toLowerCase().includes(lower))
      );
    }

    setFilteredCommunities(result);
    setCurrentPage(1); // 조건 변경 시 페이지 초기화
  }, [allCommunities, activeTab, searchQuery]);

  // 페이지네이션 처리 (한 페이지당 10개)
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredCommunities.length / itemsPerPage));
  const pagedItems = filteredCommunities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    state: {
      isLoading,
      activeTab,
      searchQuery,
      currentPage,
      filteredCommunities,
      totalPages,
      pagedItems,
    },
    actions: {
      setActiveTab,
      setSearchQuery,
      setCurrentPage,
    }
  };
}
