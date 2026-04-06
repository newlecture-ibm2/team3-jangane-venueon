'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Tabs, Pagination, InputField } from '@/components/ui';
import styles from './page.module.css';

// Mock 데이터: 더 다양한 상태(모집 중, 준비 중, 진행 중, 종료) 포함
const mockLectures = Array.from({ length: 32 }, (_, i) => {
  let status = '진행 중';
  const mod = i % 4;
  if (mod === 0) status = '모집 중';
  if (mod === 1) status = '준비 중';
  if (mod === 2) status = '진행 중';
  if (mod === 3) status = '종료';

  return {
    id: i + 1,
    status,
    title: `강의 제목 ${i + 1} — 실전 프로젝트로 배우는 웹 개발`,
    organizer: '주최자 기관명',
    dateTime: '2026.04.15 ~ 2026.05.30',
    location: i % 2 === 0 ? '서울특별시 강남구' : '온라인',
    price: i % 4 === 0 ? 0 : 80000,
  };
});

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

  // 현재 탭에 맞게 데이터 필터링
  const filteredLectures = mockLectures.filter((lecture) => {
    if (activeTab === 'upcoming') {
      return lecture.status === '모집 중' || lecture.status === '준비 중';
    }
    if (activeTab === 'enrolled') {
      return lecture.status === '진행 중';
    }
    if (activeTab === 'completed') {
      return lecture.status === '종료';
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLectures.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLectures = filteredLectures.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
                  actionButtonText="스터디룸 입장"
                  onActionClick={() => router.push(`/events`)}
                />
              ))}
            </CardGrid>

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
