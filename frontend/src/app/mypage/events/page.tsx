'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Tabs, Pagination, InputField } from '@/components/ui';
import { ReviewModal } from '@/components/modal';
import styles from './page.module.css';

interface LectureItem {
  orderId: number;
  status: string;
  title: string;
  organizer: string;
  dateTime: string;
  location: string;
  price: number;
  eventId: number;
  thumbnailUrl?: string;
  categoryId?: number;
}

const ITEMS_PER_PAGE = 8; // 2열 × 4줄

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
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);

  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 리뷰 모달 상태
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ eventId: number; title: string } | null>(null);

  // 이미 리뷰를 작성한 이벤트 ID 추적
  const [reviewedSet, setReviewedSet] = useState<Set<number>>(new Set());

  // 백엔드 API 호출
  const fetchOrders = useCallback(async (tab: string, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/me?tab=${tab}&page=${page - 1}&size=${ITEMS_PER_PAGE}`
      );
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        const validLectures = (data.content || []).filter(
          (item: any) => item.status === 'PAID' || item.status === 'REGISTERED' || item.status === 'PENDING'
        );
        const mappedLectures: LectureItem[] = validLectures.map((item: any) => ({
          orderId: item.orderId,
          eventId: item.eventId,
          title: item.eventTitle,
          status: item.eventStatus?.label || item.status,
          organizer: item.organizer || "알 수 없는 호스트",
          dateTime: item.eventStartDate ? new Date(item.eventStartDate).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }) : "-",
          location: item.location || "-",
          price: item.amount,
          thumbnailUrl: item.thumbnailUrl || undefined,
          categoryId: item.categoryId || undefined,
        }));
        setLectures(mappedLectures);
        setTotalPages(data.totalPages || 1);

        // 종료 탭일 때 각 이벤트의 리뷰 작성 여부 확인
        if (tab === 'completed') {
          const eventIds = [...new Set(mappedLectures.map(l => l.eventId))];
          const reviewed = new Set<number>();
          await Promise.all(
            eventIds.map(async (eid) => {
              try {
                const rRes = await fetch(`/api/events/${eid}/reviews/can-review`);
                const rData = await rRes.json();
                // can-review가 false면 이미 리뷰를 작성한 것
                if (rData.success && rData.data === false) {
                  reviewed.add(eid);
                }
              } catch { /* ignore */ }
            })
          );
          setReviewedSet(reviewed);
        }

        // Fetch wishlist IDs
        try {
          const wlRes = await fetch('/api/wishlists/me?size=100');
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            if (wlData.data && wlData.data.content) {
              const ids = new Set<number>(wlData.data.content.map((item: any) => item.id));
              setWishlistSet(ids);
            }
          }
        } catch (e) {
          // ignore
        }
      } else {
        setLectures([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLectures([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // 탭 또는 페이지 변경 시 API 재호출
  useEffect(() => {
    fetchOrders(activeTab, currentPage);
  }, [activeTab, currentPage, fetchOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // 리뷰 작성 가능 여부 판단
  const canWriteReview = (eventId: number) => {
    return activeTab === 'completed' && !reviewedSet.has(eventId);
  };

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

            <InputField
              variant="search"
              className={styles.searchBar}
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
                      setReviewTarget({ eventId: lecture.eventId, title: lecture.title });
                      setReviewModalOpen(true);
                    } else {
                      router.push(`/events/${lecture.eventId}`);
                    }
                  }}
                  secondaryActionText={activeTab === 'enrolled' ? '리뷰 작성하기' : undefined}
                  onSecondaryActionClick={() => {
                    if (activeTab === 'enrolled') {
                      setReviewTarget({ eventId: lecture.eventId, title: lecture.title });
                      setReviewModalOpen(true);
                    }
                  }}
                />
              ))}
            </CardGrid>

            {!loading && lectures.length === 0 && (
              <p style={{ color: 'var(--color-text-gray-500)', textAlign: 'center', width: '100%', padding: 'var(--space-48) 0' }}>
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
          onClose={() => setReviewModalOpen(false)}
          eventId={reviewTarget.eventId}
          eventTitle={reviewTarget.title}
          onSubmitSuccess={() => {
            setReviewModalOpen(false);
            // 리뷰 작성 완료 → 해당 이벤트를 reviewedSet에 추가하여 버튼 숨김
            setReviewedSet(prev => new Set(prev).add(reviewTarget.eventId));
            setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
}
