'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Card, CardGrid, InputField, Tabs, Pagination } from '@/components/ui';
import { format } from 'date-fns';


interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string;
  type: { id: number; label: string };
  status: { id: number; label: string };
  recruitmentStatus: { id: number; label: string } | null;
  location: string;
  isOnline: boolean;
  price: number;
  maxAttendees: number;
  startDate: string | null;
  endDate: string | null;
  categoryId: number;
  creatorId: number;
  recruitStartDate?: string;  // 모집 시작일
  recruitEndDate?: string;    // 모집 마감일
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categoryOptions = [
    { value: 'all', label: '전체보기' },
    { value: '1', label: '디자인' },
    { value: '2', label: '개발' },
    { value: '3', label: '마케팅' },
  ];

  const fetchEvents = async (page: number, keyword: string = '') => {
    setLoading(true);
    try {
      let url = `/api/events?page=${page - 1}&size=12&sort=latest`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      const res = await fetch(url);
      const resData = await res.json();

      if (resData.success) {
        setEvents(resData.data.content);
        setTotalPages(resData.data.totalPages);
      } else {
        console.error('Failed to fetch events:', resData.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchEvents(1, searchQuery);
    }
  };

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
