'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Tabs, Pagination } from '@/components/ui';
import { ReviewModal } from '@/components/modal';
import styles from './page.module.css';
import { useEvents } from './useEvents';

const TAB_OPTIONS = [
  { value: 'upcoming', label: '진행 전' },
  { value: 'enrolled', label: '진행 중' },
  { value: 'completed', label: '종료' },
];



function MyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || undefined;
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const resData = await res.json();
        if (resData.success && resData.data) {
          const map: Record<number, string> = {};
          resData.data.forEach((c: any) => { map[c.id] = c.name; });
          setCategoryMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const {
    activeTab,
    currentPage,
    totalPages,
    lectures,
    loading,
    wishlistSet,
    reviewModalOpen,
    reviewTarget,
    handleTabChange,
    handlePageChange,
    canWriteReview,
    openReviewModal,
    closeReviewModal,
    handleReviewSuccess,
  } = useEvents(initialTab);

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          {/* 페이지 타이틀 */}
          <h1 className={styles.pageTitle}>내 이벤트 목록</h1>

          {/* 탭 + 카드 + 페이지네이션 */}
          <div className={styles.listSection}>
            <Tabs
              variant="line"
              options={TAB_OPTIONS}
              activeValue={activeTab}
              onChange={handleTabChange}
            />



            <CardGrid layout="2-cols">
              {lectures.map((lecture) => (
                <Card
                  key={lecture.orderId}
                  variant="landing"
                  category={lecture.categoryId ? (categoryMap[lecture.categoryId] || '기타') : undefined}
                  status={lecture.status}
                  title={lecture.title}
                  imageUrl={lecture.thumbnailUrl ? `/upload/${lecture.thumbnailUrl}` : undefined}
                  eventId={lecture.eventId}
                  isWishlistedProp={wishlistSet.has(lecture.eventId)}
                  organizer={lecture.organizer}
                  dateTime={lecture.dateTime}
                  location={lecture.location}
                  price={lecture.price}
                  onCardClick={() => router.push(`/events/${lecture.eventId}`)}
                  actionButtonText={
                    lecture.hasOnlineSessions 
                      ? '온라인 입장'
                      : activeTab === 'completed' && canWriteReview(lecture.eventId) 
                        ? '리뷰 작성하기' 
                        : activeTab === 'enrolled' 
                          ? '입장하기' 
                          : '상세 보기'
                  }
                  onActionClick={() => {
                    if (lecture.hasOnlineSessions) {
                      router.push(`/mypage/orders/${lecture.orderId}`);
                    } else if (activeTab === 'completed' && canWriteReview(lecture.eventId)) {
                      openReviewModal(lecture.eventId, lecture.title);
                    } else {
                      router.push(`/events/${lecture.eventId}`);
                    }
                  }}
                  secondaryActionText={activeTab === 'enrolled' && canWriteReview(lecture.eventId) ? '리뷰 작성하기' : undefined}
                  onSecondaryActionClick={() => {
                    if (activeTab === 'enrolled' && canWriteReview(lecture.eventId)) {
                      openReviewModal(lecture.eventId, lecture.title);
                    }
                  }}
                />
              ))}
            </CardGrid>

            {!loading && lectures.length === 0 && (
              <p className={styles.emptyState}>
                해당 탭에 이벤트가 없습니다.
              </p>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {reviewTarget && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={closeReviewModal}
          eventId={reviewTarget.eventId}
          eventTitle={reviewTarget.title}
          onSubmitSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>로딩 중...</div>}>
      <MyPageContent />
    </Suspense>
  );
}
