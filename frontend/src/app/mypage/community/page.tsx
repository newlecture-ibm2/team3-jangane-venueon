'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { CardGrid, Pagination, InputField, Tabs } from '@/components/ui';
import CommunityListCard from '@/app/community/components/CommunityListCard';
import styles from './page.module.css';

import { useCommunity } from './useCommunity';

import CommunityPostItem from '@/app/community/components/CommunityPostItem';

const TAB_OPTIONS = [
  { value: 'participating', label: '참여 중' },
  { value: 'post_bookmark', label: '게시물 북마크' },
];

export default function MyCommunityPage() {
  const {
    activeTab,
    currentPage,
    totalPages,
    communityList,
    isLoading,
    handleTabChange,
    handlePageChange,
  } = useCommunity();

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          {/* 페이지 타이틀 */}
          <h1 className={styles.pageTitle}>내 커뮤니티</h1>

          <div className={styles.listSection}>
            <Tabs
              variant="line"
              options={TAB_OPTIONS}
              activeValue={activeTab}
              onChange={handleTabChange}
            />

            <InputField
              variant="search"
              className={styles.searchBar}
            />

            {/* participating 탭이면 CommunityListCard(커뮤니티 페이지와 동일), post_bookmark 탭이면 수직 리스트 */}
            {activeTab === 'post_bookmark' ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {isLoading ? (
                  <div style={{ padding: 'var(--space-48)', textAlign: 'center', color: 'var(--color-text-gray-500)' }}>
                    불러오는 중...
                  </div>
                ) : communityList.length === 0 ? (
                  <div style={{ padding: 'var(--space-48)', textAlign: 'center', color: 'var(--color-text-gray-500)' }}>
                    해당 항목이 없습니다.
                  </div>
                ) : (
                  communityList.map((post: any) => (
                    <CommunityPostItem
                      key={post.id}
                      title={post.title}
                      username={post.username || "익명"}
                      date={post.date || ""}
                      avatarUrl={post.avatarUrl}
                      isNotice={post.isNotice}
                      isPinned={post.isPinned}
                      type={post.postType}
                      onClick={() => { /* 상세 페이지 이동 로직. 추후 구현 */ }}
                    />
                  ))
                )}
              </div>
            ) : (
              <CardGrid layout="2-cols">
                {isLoading ? (
                  <div style={{ gridColumn: '1 / -1', padding: 'var(--space-48)', textAlign: 'center', color: 'var(--color-text-gray-500)' }}>
                    불러오는 중...
                  </div>
                ) : communityList.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: 'var(--space-48)', textAlign: 'center', color: 'var(--color-text-gray-500)' }}>
                    해당 항목이 없습니다.
                  </div>
                ) : (
                  communityList.map((community: any) => (
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
                  ))
                )}
              </CardGrid>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
