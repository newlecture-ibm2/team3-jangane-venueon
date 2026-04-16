'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventListSection.module.css';
import { Card, CardGrid, InputField, Pagination, FilterDropdown, FilterChip } from '@/components/ui';
import { format } from 'date-fns';
import {
  EventData,
  isOnlineOptions,
  recruitmentOptions,
  eventStatusOptions,
} from '../../useHome';

interface EventListSectionProps {
  events: EventData[];
  wishlistSet: Set<number>;
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  activeIsOnline: string;
  setActiveIsOnline: (val: string) => void;
  activeRecruitmentStatus: string;
  setActiveRecruitmentStatus: (val: string) => void;
  activeEventStatus: string;
  setActiveEventStatus: (val: string) => void;
  categoryOptions: { value: string; label: string }[];
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function EventListSection({
  events,
  wishlistSet,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  activeIsOnline,
  setActiveIsOnline,
  activeRecruitmentStatus,
  setActiveRecruitmentStatus,
  activeEventStatus,
  setActiveEventStatus,
  categoryOptions,
  handleSearch,
}: EventListSectionProps) {
  const router = useRouter();

  // 💡 최적화: 현재 시간은 반복문 밖에서 한 번만 연산
  const nowTime = new Date().getTime();

  return (
    <div className={styles.container}>
      {/* 필터 및 검색 섹션 */}
      <section className={styles.filterSection}>
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <InputField
              variant="search"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <div className={styles.dropdownGroup}>
            <FilterDropdown
              options={categoryOptions}
              value={activeCategory}
              onChange={(val) => { setActiveCategory(val); setCurrentPage(1); }}
            />
            <FilterDropdown
              options={isOnlineOptions}
              value={activeIsOnline}
              onChange={(val) => { setActiveIsOnline(val); setCurrentPage(1); }}
            />
            <FilterDropdown
              options={recruitmentOptions}
              value={activeRecruitmentStatus}
              onChange={(val) => { setActiveRecruitmentStatus(val); setCurrentPage(1); }}
            />
            <FilterDropdown
              options={eventStatusOptions}
              value={activeEventStatus}
              onChange={(val) => { setActiveEventStatus(val); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className={styles.activeFilters}>
          {activeCategory !== 'all' && (
            <FilterChip
              label={categoryOptions.find(o => o.value === activeCategory)?.label || ''}
              onClose={() => setActiveCategory('all')}
            />
          )}
          {activeIsOnline !== 'all' && (
            <FilterChip
              label={isOnlineOptions.find(o => o.value === activeIsOnline)?.label || ''}
              onClose={() => setActiveIsOnline('all')}
            />
          )}
          {activeRecruitmentStatus !== 'all' && (
            <FilterChip
              label={recruitmentOptions.find(o => o.value === activeRecruitmentStatus)?.label || ''}
              onClose={() => setActiveRecruitmentStatus('all')}
            />
          )}
          {activeEventStatus !== 'all' && (
            <FilterChip
              label={eventStatusOptions.find(o => o.value === activeEventStatus)?.label || ''}
              onClose={() => setActiveEventStatus('all')}
            />
          )}
        </div>
      </section>

      {/* 이벤트 카드 리스트 */}
      <section className={styles.content}>
        {loading ? (
          <div>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>등록된 이벤트가 없습니다.</div>
        ) : (
          <CardGrid layout="3-cols">
            {events.map((event) => {
              let dDayData: number | string | undefined = undefined;
              let dateTimeStr = '일정 미정';

              if (event.startDate) {
                try {
                  dateTimeStr = format(new Date(event.startDate), 'yyyy년 M월 d일 a h시');
                } catch (e) { }
              }

              // 모집상태별 D-Day 기준 분기
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

              // 간단한 카테고리 맵핑
              const categoryLabel = categoryOptions.find(c => c.value === String(event.categoryId))?.label || '기타';

              return (
                <div
                  key={event.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <Card
                    variant="landing"
                    category={categoryLabel}
                    dDay={dDayData}
                    title={event.title}
                    eventId={event.id}
                    isWishlistedProp={wishlistSet.has(event.id)}
                    imageUrl={event.thumbnailUrl ? `/upload/${event.thumbnailUrl}` : ''}
                    organizer={event.creatorName || `호스트 ${event.creatorId}`}
                    dateTime={dateTimeStr}
                    location={event.isOnline ? '온라인 (Zoom 등)' : (event.primaryLocation || '장소 미정')}
                    price={event.minPrice !== null ? event.minPrice : 0}
                    originalPrice={event.hasDiscount && event.originalPrice ? event.originalPrice : undefined}
                    status={event.status?.label || 'DRAFT'}
                    recruitmentStatus={event.recruitmentStatus?.label || 'PENDING'}
                  />
                </div>
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
  );
}
