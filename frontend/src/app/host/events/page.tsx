'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { StatusTag, Pagination } from '@/components/ui';
import styles from './page.module.css';

import { useHostEvents } from './useHostEvents';

export default function HostEventsPage() {
  const {
    eventsData,
    loading,
    activeTab,
    setActiveTab,
    fetchEvents,
    handlePageChange
  } = useHostEvents();

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab, fetchEvents]);

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
      <main className="sidebar-content">
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
            <Link href="/host/events/new" className={styles.createBtn}>
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
                    {event.status?.id === 3 || event.status?.id === 4 ? (
                      <StatusTag domain="course" status={event.status} />
                    ) : null}
                    <StatusTag domain="recruitment" status={event.recruitmentStatus} />
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

          {eventsData && eventsData.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <Pagination
                currentPage={eventsData.page + 1}
                totalPages={eventsData.totalPages}
                onPageChange={(p) => handlePageChange(p - 1)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
