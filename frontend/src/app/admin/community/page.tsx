'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout';
import { useUIStore } from '@/store/useUIStore';
import { Pagination, InputField, Tabs, CardGrid } from '@/components/ui';
import CommunityCard from '@/app/community/components/CommunityCard';
import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/admin-api';
import { format } from 'date-fns';
import styles from './AdminCommunityPage.module.css';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  creatorNickname: string;
  eventName: string | null;
  createdAt: string;
}

const TAB_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'GENERAL', label: '일반 커뮤니티' },
  { value: 'EVENT', label: '이벤트 연동' },
];

export default function AdminCommunityPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
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

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />
      <div className="sidebar-content">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>커뮤니티 관리</h1>
          </div>

          <div className={styles.listSection}>
            <Tabs
              variant="line"
              options={TAB_OPTIONS}
              activeValue={activeTab}
              onChange={(val) => {
                setActiveTab(val);
              }}
            />

            <InputField
              variant="search"
              className={styles.searchBar}
              placeholder="커뮤니티 이름 또는 태그로 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className={styles.cardGrid}>
              <CardGrid layout="2-cols">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} style={{ height: '240px', borderRadius: '12px', backgroundColor: '#f3f4f6' }} />
                  ))
                ) : pagedItems.length === 0 ? (
                  <div className={styles.empty}>해당하는 커뮤니티가 없습니다.</div>
                ) : (
                  pagedItems.map((item) => (
                    <CommunityCard
                      key={item.id}
                      title={item.name}
                      postType={item.eventName || '일반 커뮤니티'}
                      timeAgo={item.createdAt ? format(new Date(item.createdAt), 'yyyy.MM.dd') : '—'}
                      keywords={item.description ? item.description.split(' ').slice(0, 3) : ['커뮤니티']}
                      actionButtonText="관리하기"
                      onActionClick={() => router.push(`/community/${item.id}`)}
                    />
                  ))
                )}
              </CardGrid>
            </div>

            {filteredCommunities.length > 0 && (
              <div className={styles.paginationArea}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
