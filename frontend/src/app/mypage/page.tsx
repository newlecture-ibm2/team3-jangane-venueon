'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Tabs, Pagination, InputField } from '@/components/ui';
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
  { value: 'upcoming', label: '수강 예정' },
  { value: 'enrolled', label: '수강 중' },
  { value: 'completed', label: '수강 완료' },
];

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);

  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 백엔드 API 호출
  const fetchOrders = useCallback(async (tab: string, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/users/me/orders?tab=${tab}&page=${page - 1}&size=${ITEMS_PER_PAGE}`
      );
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setLectures(data.content || []);
        setTotalPages(data.totalPages || 1);
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
          <h1 className={styles.pageTitle}>내 강의 목록</h1>

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
              placeholder="검색어를 입력하세요."
              className={styles.searchBar}
            />

            <CardGrid layout="2-cols">
              {lectures.map((lecture) => (
                <Card
                  key={lecture.orderId}
                  status={lecture.status}
                  title={lecture.title}
                  organizer={lecture.organizer}
                  dateTime={lecture.dateTime}
                  location={lecture.location}
                  price={lecture.price}
                  actionButtonText="스터디룸 입장"
                  onActionClick={() => router.push(`/events/${lecture.eventId}`)}
                />
              ))}
            </CardGrid>

            {!loading && lectures.length === 0 && (
              <p style={{ color: 'var(--color-text-gray-500)', textAlign: 'center', width: '100%', padding: 'var(--space-48) 0' }}>
                해당 탭에 강의가 없습니다.
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
    </div>
  );
}
