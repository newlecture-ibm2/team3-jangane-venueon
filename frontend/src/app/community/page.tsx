'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Pagination, CardGrid, Tabs } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';
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

function CommunityListContent() {
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

  const handleCreateClick = () => {
    if (!isLoggedIn) {
      showToast('로그인 필요', 'error', '커뮤니티를 만들려면 로그인이 필요합니다.');
      return;
    }
    const isAdmin = user?.role?.id === 1;
    const isHost = user?.role?.id === 3;
    if (isAdmin || isHost || hasBadges) {
      window.location.href = '/community/create';
    } else {
      showToast('기능 제한', 'info', '커뮤니티 생성은 뱃지 보유자만 가능합니다.');
    }
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <main className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            {activeTab === 'joined' ? '내가 참여한 커뮤니티' : '전체 커뮤니티 탐색'}
          </h1>
          <Button variant="primary" onClick={handleCreateClick}>
            커뮤니티 만들기
          </Button>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isLoading ? (
            <div className={styles.loadingOrEmpty}>커뮤니티 목록을 불러오는 중...</div>
          ) : communities.length === 0 ? (
            <div className={styles.loadingOrEmpty}>아직 표시할 커뮤니티가 없습니다.</div>
          ) : (
            <CardGrid layout="2-cols">
              {communities.map((community) => (
                <CommunityListCard
                  key={community.id}
                  status="PUBLISHED"
                  tagText={community.memberCount > 5 ? "인기" : "신규"}
                  tagVariant={community.memberCount > 5 ? "purple" : "green"}
                  title={community.name}
                  organizer={`주최자: ${community.creatorNickname}`}
                  dateTime={`생성일: ${new Date(community.createdAt).toLocaleDateString()}`}
                  location={`멤버: ${community.memberCount}명 참여 중`}
                  price={0}
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

export default function CommunityListPage() {
  return (
    <Suspense fallback={<div className="container-sidebar"><Sidebar role="user" /><main className="sidebar">로딩 중...</main></div>}>
      <CommunityListContent />
    </Suspense>
  );
}
