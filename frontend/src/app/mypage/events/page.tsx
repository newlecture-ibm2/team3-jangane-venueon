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
}

const ITEMS_PER_PAGE = 8; // 2열 × 4줄

const TAB_OPTIONS = [
  { value: 'upcoming', label: '진행 전' },
  { value: 'enrolled', label: '진행 중' },
  { value: 'completed', label: '종료' },
];

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
          status: item.eventStatus || item.status, // 주문 상태 대신 세션(세션) 상태를 카드에 매핑
          organizer: item.organizer || "알 수 없는 호스트",
          dateTime: item.eventStartDate ? new Date(item.eventStartDate).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }) : "-",
          location: item.location || "-",
          price: item.amount
        }));
        setLectures(mappedLectures);
        setTotalPages(data.totalPages || 1);

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

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          {/* 페이지 타이틀 */}
          <h1 className={styles.pageTitle}>내 세션 목록</h1>

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
                  status={lecture.status}
                  title={lecture.title}
                  eventId={lecture.eventId}
                  isWishlistedProp={wishlistSet.has(lecture.eventId)}
                  organizer={lecture.organizer}
                  dateTime={lecture.dateTime}
                  location={lecture.location}
                  price={lecture.price}
                  actionButtonText={
                    activeTab === 'completed' ? '리뷰 작성하기' :
                      activeTab === 'enrolled' ? '입장하기' :
                        '상세 보기'
                  }
                  onActionClick={() => {
                    if (activeTab === 'completed') {
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
                해당 탭에 세션이 없습니다.
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
            setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
}
