'use client';

import React, { useState, useEffect } from 'react';
import { Button, Pagination, CardGrid, Tabs } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import { useUIStore } from '@/store/useUIStore';
import CommunityListCard from './components/CommunityListCard';
import styles from './page.module.css';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  creatorNickname: string;
  createdAt: string;
  canManage: boolean; // 권한 정보 추가
}

interface PageData {
  content: CommunityItem[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export default function CommunityListPage() {
  const { showToast } = useUIStore();
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/communities?page=${currentPage - 1}&size=12`);
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
  }, [currentPage]);

  const tabOptions = [
    { value: 'all', label: '전체' },
    { value: 'study', label: '학습' },
    { value: 'qna', label: '질의응답' },
    { value: 'networking', label: '네트워킹' },
    { value: 'etc', label: '기타' },
  ];

  return (
    <div className="container-sidebar">
      {/* 기존 Sidebar 컴포넌트 활용 */}
      <Sidebar role="user" />

      {/* 메인 콘텐츠 영역 (사이드바 내부 main 역할) */}
      <main className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>커뮤니티 탐색</h1>
          <Button variant="primary" onClick={() => window.location.href = '/community/create'}>
            커뮤니티 만들기
          </Button>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 기존 Tabs 컴포넌트 활용 */}
          <Tabs 
            variant="line" 
            options={tabOptions} 
            activeValue={activeTab} 
            onChange={setActiveTab} 
          />

          {isLoading ? (
            <div className={styles.loadingOrEmpty}>커뮤니티 목록을 불러오는 중...</div>
          ) : communities.length === 0 ? (
            <div className={styles.loadingOrEmpty}>아직 표시할 커뮤니티가 없습니다.</div>
          ) : (
            /* 기존 CardGrid 컴포넌트 활용 */
            <CardGrid layout="2-cols">
              {communities.map((community) => (
                /* 기존 Card 컴포넌트 활용 (프라퍼티 매핑) */
                <CommunityListCard
                  key={community.id}
                  status="PUBLISHED" // '모집 중' 배지 효과
                  tagText="활발함"
                  tagVariant="green"
                  title={community.name}
                  organizer={`주최자: ${community.creatorNickname}`}
                  dateTime={`생성일: ${new Date(community.createdAt).toLocaleDateString()}`}
                  location={`멤버: ${community.memberCount}명 참여 중`}
                  price={0} // '무료 참여' 표시
                  actionButtonText="커뮤니티 입장하기"
                  onActionClick={() => window.location.href = `/community/${community.id}`}
                  onEditClick={community.canManage ? () => window.location.href = `/community/${community.id}/edit` : undefined}
                />
              ))}
            </CardGrid>
          )}
        </section>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
