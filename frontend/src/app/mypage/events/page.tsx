'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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

const CATEGORY_MAP: Record<number, string> = {
  1: '디자인',
  2: '개발',
  3: '마케팅',
};

export default function MyPage() {
  const router = useRouter();
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
  } = useEvents();

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
                  category={lecture.categoryId ? (CATEGORY_MAP[lecture.categoryId] || '기타') : undefined}
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
                    canWriteReview(lecture.eventId) 
                      ? '리뷰 작성하기' 
                      : activeTab === 'enrolled' 
                        ? '입장하기' 
                        : '상세 보기'
                  }
                  onActionClick={() => {
                    if (canWriteReview(lecture.eventId)) {
                      openReviewModal(lecture.eventId, lecture.title);
                    } else {
                      router.push(`/events/${lecture.eventId}`);
                    }
                  }}
                  secondaryActionText={activeTab === 'enrolled' ? '리뷰 작성하기' : undefined}
                  onSecondaryActionClick={() => {
                    if (activeTab === 'enrolled') {
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
