'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Card, CardGrid, InputField, Tabs, Pagination, FilterDropdown, FilterChip } from '@/components/ui';
import { format } from 'date-fns';


interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  type: string;
  status: { id: number; label: string };
  recruitmentStatus: { id: number; label: string };
  categoryId: number;
  creatorId: number;
  creatorName: string;
  createdAt: string;
  hasSession: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  hasDiscount: boolean;
  originalPrice: number | null;
  primaryLocation: string | null;
  isOnline: boolean;
  startDate?: string;
  recruitStartDate?: string;  // 모집 시작일
  recruitEndDate?: string;    // 모집 마감일
}

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeIsOnline, setActiveIsOnline] = useState('all');
  const [activeRecruitmentStatus, setActiveRecruitmentStatus] = useState('all');
  const [activeEventStatus, setActiveEventStatus] = useState('all');

  const [categoryOptions, setCategoryOptions] = useState<{value: string, label: string}[]>([
    { value: 'all', label: '카테고리: 전체' }
  ]);

  const isOnlineOptions = [
    { value: 'all', label: '온/오프라인: 전체' },
    { value: 'true', label: '온라인' },
    { value: 'false', label: '오프라인' }
  ];

  const recruitmentOptions = [
    { value: 'all', label: '모집상태: 전체' },
    { value: '1', label: '모집예정' },
    { value: '2', label: '모집중' },
    { value: '3', label: '모집마감' }
  ];

  const eventStatusOptions = [
    { value: 'all', label: '진행상태: 전체' },
    { value: '2', label: '진행예정' },
    { value: '3', label: '진행중' },
    { value: '4', label: '종료됨' }
  ];

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
          setCategoryOptions([{ value: 'all', label: '카테고리: 전체' }, ...opts]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchEvents = async (
      page: number, 
      keyword: string = '', 
      categoryId: string = 'all',
      isOnline: string = 'all',
      recruitmentStatusId: string = 'all',
      eventStatusId: string = 'all'
    ) => {
    setLoading(true);
    try {
      // Backend pagination is 0-indexed, UI is 1-indexed
      let url = `/api/events?page=${page - 1}&size=12&sort=latest`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }
      if (categoryId !== 'all') {
        url += `&categoryId=${categoryId}`;
      }
      if (isOnline !== 'all') {
        url += `&isOnline=${isOnline}`;
      }
      if (recruitmentStatusId !== 'all') {
        url += `&recruitmentStatusId=${recruitmentStatusId}`;
      }
      if (eventStatusId !== 'all') {
        url += `&eventStatusId=${eventStatusId}`;
      }

      const res = await fetch(url);
      const resData = await res.json();

      if (resData.success) {
        setEvents(resData.data.content);
        setTotalPages(resData.data.totalPages);

        // Wishlist도 동시에 조회 (비로그인이거나 에러시 조용히 넘어감)
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
          // ignore error (e.g. not logged in)
        }
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
    fetchEvents(currentPage, searchQuery, activeCategory, activeIsOnline, activeRecruitmentStatus, activeEventStatus);
  }, [currentPage, activeCategory, activeIsOnline, activeRecruitmentStatus, activeEventStatus]);

  // Handle Search Submit
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchEvents(1, searchQuery, activeCategory, activeIsOnline, activeRecruitmentStatus, activeEventStatus);
    }
  };

  // 💡 최적화: 현재 시간은 반복문 밖에서 한 번만 연산
  const nowTime = new Date().getTime();

  return (
    <div className="container-full">
      {/* 배너 섹션 (Hero) - 풀 와이드 */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Skills to transform<br />
              your career and life
            </h1>
            <p className={styles.heroSubtitle}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div className={styles.heroImageBox}></div>
        </div>
      </section>

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

        {/* 세션 카드 리스트 */}
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
                  } catch(e) {}
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
                
                // 간단한 카테고리 맵핑 (프론트에서 관리하는 카테고리가 있다면 가져옴)
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
    </div>
  );
}
