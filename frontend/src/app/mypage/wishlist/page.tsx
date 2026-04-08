'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Pagination, InputField } from '@/components/ui';
import styles from '../seminars/page.module.css';

// 관심 목록용 임시 데이터
const mockWishlistLectures = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: i % 2 === 0 ? '모집 중' : '진행 중',
  title: `찜한 강의 ${i + 1} — 정말 듣고 싶은 클래스`,
  organizer: '최고의 강사진',
  dateTime: '2026.05.01 ~ 2026.06.30',
  location: '온라인',
  price: 45000,
}));

const ITEMS_PER_PAGE = 8;

export default function WishlistPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(mockWishlistLectures.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLectures = mockWishlistLectures.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>찜 목록</h1>

          <div className={styles.listSection}>
            <InputField
              variant="search"
              className={styles.searchBar}
            />

            <CardGrid layout="2-cols">
              {currentLectures.map((lecture) => (
                <Card
                  key={lecture.id}
                  status={lecture.status}
                  title={lecture.title}
                  organizer={lecture.organizer}
                  dateTime={lecture.dateTime}
                  location={lecture.location}
                  price={lecture.price}
                  actionButtonText="자세히 보기"
                  onActionClick={() => router.push(`/events`)}
                />
              ))}
            </CardGrid>

            {mockWishlistLectures.length > 0 && (
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
