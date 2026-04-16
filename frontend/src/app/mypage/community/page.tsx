'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { CardGrid, Pagination, InputField, Tabs } from '@/components/ui';
import CommunityCard from '@/app/community/_components/CommunityCard';
import styles from './page.module.css';
import { useCommunity } from './useCommunity';
import CommunityPostItem from '@/app/community/_components/CommunityPostItem';

const TAB_OPTIONS = [
  { value: 'participating', label: '참여 중' },
  { value: 'post_bookmark', label: '게시물 북마크' },
];

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function MyCommunityPage() {
  const router = useRouter();
  const {
    activeTab,
    currentPage,
    totalPages,
    items,
    isLoading,
    handleTabChange,
    handlePageChange,
  } = useCommunity();

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>내 커뮤니티</h1>

          <div className={styles.listSection}>
            <Tabs
              variant="line"
              options={TAB_OPTIONS}
              activeValue={activeTab}
              onChange={handleTabChange}
            />

            {isLoading ? (
              <div className={styles.emptyState}>데이터를 불러오는 중...</div>
            ) : items.length === 0 ? (
              <div className={styles.emptyState}>
                해당하는 {activeTab === 'participating' ? '커뮤니티가' : '게시물이'} 없습니다.
              </div>
            ) : activeTab === 'participating' ? (
              <CardGrid layout="2-cols">
                {items.map((community: any) => (
                  <CommunityCard
                    key={community.id}
                    postType={community.memberCount > 5 ? '인기 커뮤니티' : '일반 커뮤니티'}
                    timeAgo={`생성일: ${formatDate(community.createdAt)}`}
                    title={community.name}
                    keywords={[
                      ...(community.creatorNickname ? [`주최자: ${community.creatorNickname}`] : []),
                      `멤버: ${community.memberCount || 0}명`
                    ]}
                    actionButtonText="커뮤니티 입장하기"
                    onActionClick={() => router.push(`/community/${community.id}`)}
                  />
                ))}
              </CardGrid>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {items.map((post: any) => (
                  <CommunityPostItem
                    key={post.postId || post.id}
                    title={post.title}
                    username={post.authorNickname || post.author || '익명'}
                    date={formatDate(post.createdAt)}
                    type={post.postType || 'FREE'}
                    onClick={() => router.push(`/community/${post.communityId}?post=${post.postId || post.id}`)}
                  />
                ))}
              </div>
            )}

            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
