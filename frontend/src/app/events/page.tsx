'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Card, CardGrid, InputField, Tabs, Pagination } from '@/components/ui';
import { format } from 'date-fns';


import { useEvents } from './useEvents';

export default function EventsPage() {
  const {
    events,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    fetchEvents
  } = useEvents();

  useEffect(() => {
    fetchEvents(currentPage, searchQuery);
  }, [currentPage, fetchEvents]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchEvents(1, searchQuery);
    }
  };

  const [categoryOptions, setCategoryOptions] = useState<{ value: string, label: string }[]>([
    { value: 'all', label: '전체보기' }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const resData = await res.json();
        if (resData.success && resData.data) {
          const opts = resData.data.map((c: any) => ({
            value: String(c.id),
            label: c.name
          }));
          setCategoryOptions([{ value: 'all', label: '전체보기' }, ...opts]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // 💡 최적화: 현재 시간은 카드 개수만큼 여러 번 계산할 필요 없이 한 번만 계산합니다.
  const nowTime = new Date().getTime();

  return (
    <div className="container-full">
      <div className={styles.container}>
        {/* 필터 및 검색 섹션 (영웅 배너 없음) */}
        <section className={styles.filterSection}>
          <div className={styles.searchBox}>
            <InputField
              variant="search"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <div className={styles.tagGroup}>
            <Tabs
              variant="pill"
              options={categoryOptions}
              activeValue={activeCategory}
              onChange={(val) => setActiveCategory(val)}
            />
          </div>
        </section>

        {/* 세션 카드 리스트 */}
        <section className={styles.content}>
          {loading ? (
            <div>Loading...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>검색 결과가 없습니다.</div>
          ) : (
            <CardGrid layout="3-cols">
              {events.map((event) => {
                // 모집상태별 D-Day 기준 분기
                let dDayData: number | string | undefined = undefined;
                const recruitStatusId = event.recruitmentStatus?.id;
                if (recruitStatusId === 1 && event.recruitStartDate) {
                  // 모집 예정 → 모집 시작일까지 D-Day
                  const diffDays = Math.ceil((new Date(event.recruitStartDate).getTime() - nowTime) / (1000 * 60 * 60 * 24));
                  dDayData = diffDays > 0 ? diffDays : (diffDays === 0 ? 'D-Day' : undefined);
                } else if (recruitStatusId === 2 && event.recruitEndDate) {
                  // 모집 중 → 모집 마감일까지 D-Day
                  const diffDays = Math.ceil((new Date(event.recruitEndDate).getTime() - nowTime) / (1000 * 60 * 60 * 24));
                  dDayData = diffDays > 0 ? diffDays : (diffDays === 0 ? 'D-Day' : undefined);
                }
                // 모집마감(id===3)이면 D-Day 표시 안 함
                
                const categoryLabel = categoryOptions.find(c => c.value === String(event.categoryId))?.label || '기타';

                return (
                  <Link href={`/events/${event.id}`} key={event.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card
                      variant="landing"
                      category={categoryLabel}
                      dDay={dDayData}
                      title={event.title}
                      imageUrl={event.thumbnailUrl ? `/upload/${event.thumbnailUrl}` : ''}
                      organizer={`호스트 ${event.creatorId}`}
                      dateTime={event.startDate ? format(new Date(event.startDate), 'yyyy년 M월 d일 a h시') : '일정 미정'}
                      location={event.isOnline ? '온라인' : (event.location || '장소 미정')}
                      price={event.price ?? 0}
                      status={event.status?.label}
                      recruitmentStatus={event.recruitmentStatus?.label || undefined}
                    />
                  </Link>
                );
              })}
            </CardGrid>
          )}

          {/* 페이지네이션 */}
          {!loading && totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
