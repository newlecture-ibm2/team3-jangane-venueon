'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  type: string;
  status: { id: number; label: string };
  recruitmentStatus: { id: number; label: string };
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  startDate: string;
  endDate: string;
  location: string;
  hostName?: string;
}

interface PageData {
  content: EventData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export default function HostEventsPage() {
  const [eventsData, setEventsData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const fetchEvents = async (status: string, page: number = 0) => {
    setLoading(true);
    try {
      let endpoint = `/host/events?page=${page}&size=10`;
      if (status === 'DRAFT') {
        endpoint = `/host/events/drafts?page=${page}&size=10`;
      } else if (status !== 'ALL') {
        endpoint += `&status=${status}`;
      }
      
      const res = await api.get<{ status: string; data: PageData }>(endpoint);
      setEventsData(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // ... (mock data removed for shortness in instruction, remains in file)
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (eventsData && newPage >= 0 && newPage < eventsData.totalPages) {
      fetchEvents(activeTab, newPage);
    }
  };

  const tabs = [
    { value: 'ALL', label: '전체' },
    { value: 'DRAFT', label: '임시 저장' },
    { value: 'PUBLISHED', label: '수강생 모집 중' },
    { value: 'ONGOING', label: '강의 준비 중' },
    { value: 'ENDED', label: '종료된 강의' },
  ];

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      
      <main className="sidebar">
        <div className={styles.dashboardWrapper}>
          <div className={styles.topRow}>
            <div className={styles.tabsContainer}>
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  className={`${styles.tabBtn} ${activeTab === tab.value ? styles.activeTab : ''}`}
                  onClick={() => {
                    setActiveTab(tab.value);
                    fetchEvents(tab.value, 0); // 탭 변경 시 0페이지로
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link href="/events/new" className={styles.createBtn}>
              + 새 강의 만들기
            </Link>
          </div>

          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" className={styles.searchInput} placeholder="검색어를 입력하세요" />
          </div>

          <div className={styles.cardGrid}>
            {loading ? (
              <p>불러오는 중...</p>
            ) : eventsData?.content && eventsData.content.length > 0 ? (
              eventsData.content.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.cardBadges}>
                    {event.status?.label === '진행중' || event.status?.label === '종료됨' ? (
                      <span className={`${styles.cardBadge} ${event.status.label === '종료됨' ? styles.badgeEnded : styles.badgeOngoing}`}>
                        {event.status.label}
                      </span>
                    ) : null}
                    <span className={`${styles.cardBadge} ${event.recruitmentStatus?.label === '모집마감' ? styles.badgeClosed : ''}`}>
                      {event.recruitmentStatus?.label || '상태 미정'}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <div className={styles.thumbnailPlaceholder}>
                    {event.thumbnailUrl ? (
                      <img 
                        src={event.thumbnailUrl.startsWith('/') || event.thumbnailUrl.startsWith('http') ? event.thumbnailUrl : `/upload/${event.thumbnailUrl}`} 
                        alt="Thumbnail" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : null}
                  </div>
                  
                  <div className={styles.cardInfo}>
                    <div className={styles.infoItem}>
                      🏢 {event.hostName || '주최자 기관명'}
                    </div>
                    <div className={styles.infoItem}>
                      📅 {new Date(event.startDate).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: 'numeric'
                      })}
                    </div>
                    <div className={styles.infoItem}>
                      📍 {event.location}
                    </div>
                  </div>

                  <div className={styles.cardPrice}>
                    {event.hasDiscount && (
                      <span className={styles.originalPrice}>₩{event.originalPrice?.toLocaleString()}</span>
                    )}
                    <span className={styles.currentPrice}>₩{event.price?.toLocaleString() || '0'}</span>
                  </div>

                  <Link href={`/host/events/${event.id}`} className={styles.manageBtn}>
                    스터디홈 입장
                  </Link>
                </div>
              ))
            ) : (
                <p>등록된 강의가 없습니다.</p>
            )}
          </div>

          {eventsData && eventsData.totalPages > 0 && (
            <div className={styles.pagination}>
              <button 
                className={styles.arrow} 
                onClick={() => handlePageChange(eventsData.page - 1)}
                disabled={eventsData.page === 0}
              >{"<"}</button>
              
              {[...Array(eventsData.totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`${styles.page} ${eventsData.page === i ? styles.activePage : ''}`}
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className={styles.arrow} 
                onClick={() => handlePageChange(eventsData.page + 1)}
                disabled={eventsData.page === eventsData.totalPages - 1}
              >{">"}</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
