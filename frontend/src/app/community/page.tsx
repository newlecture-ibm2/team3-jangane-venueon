'use client';

import React, { Suspense } from 'react';
import { Button, Pagination, CardGrid } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import CommunityCard from './_components/CommunityCard';
import { useCommunityList } from './useCommunityList';
import styles from './page.module.css';

function CommunityListContent() {
  const {
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
  } = useCommunityList();

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
                <CommunityCard
                  key={community.id}
                  category={community.eventCategory || (community.memberCount > 5 ? "인기 커뮤니티" : "새로운 커뮤니티")}
                  createdAt={community.lastPostCreatedAt || community.createdAt}
                  title={community.name}
                  organizer={community.creatorNickname}
                  dateTime={new Date(community.createdAt).toLocaleDateString()}
                  location={community.eventLocation || "커뮤니티 광장"}
                  actionButtonText="커뮤니티 입장하기"
                  onActionClick={() => window.location.href = `/community/${community.id}`}
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
