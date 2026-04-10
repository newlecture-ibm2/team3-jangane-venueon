'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Card, CardGrid, InputField, Tabs, Pagination } from '@/components/ui';
import { format } from 'date-fns';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string;
  type: string;
  status: string;
  location: string;
  isOnline: boolean;
  price: number;
  maxAttendees: number;
  startDate: string;
  endDate: string;
  categoryId: number;
  creatorId: number;
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

  const categoryOptions = [
    { value: 'all', label: '전체보기' },
    { value: '1', label: '디자인' },
    { value: '2', label: '개발' },
    { value: '3', label: '마케팅' },
  ];

  const fetchEvents = async (page: number, keyword: string = '') => {
    setLoading(true);
    try {
      // Backend pagination is 0-indexed, UI is 1-indexed
      let url = `/api/events?page=${page - 1}&size=12&sort=latest`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
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
    fetchEvents(currentPage, searchQuery);
  }, [currentPage]);

  // Handle Search Submit
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchEvents(1, searchQuery);
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
            <div style={{ textAlign: 'center', padding: '100px 0' }}>등록된 세션가 없습니다.</div>
          ) : (
            <CardGrid layout="3-cols">
              {events.map((event) => {
                const startTime = new Date(event.startDate).getTime();
                const diffDays = Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24));
                const dDayData = diffDays > 0 ? diffDays : (diffDays === 0 ? 'D-Day' : undefined);
                
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
                      imageUrl={event.thumbnailUrl ? `${BACKEND_URL}/upload/${event.thumbnailUrl}` : ''}
                      organizer={`호스트 ${event.creatorId}`} // 백엔드 조인 시 실제 이름으로 변경
                      dateTime={format(new Date(event.startDate), 'yyyy년 M월 d일 a h시')}
                      location={event.isOnline ? '온라인' : event.location}
                      price={event.price}
                      status={event.status}
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
