'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Tabs, Table, TableHeader, TableRow, TableCell, Button } from '@/components/ui';
import styles from './page.module.css';
import { useDashboard, DashboardEventItem } from './useDashboard';

const TAB_OPTIONS = [
  { value: 'resume', label: '진행 중' },
  { value: 'schedule', label: '다가오는 일정' },
];

export default function MyPageDashboard() {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    summaryData,
    events,
    isLoadingEvents
  } = useDashboard();

  // 날짜 포맷 함수
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // D-Day 계산 함수
  const calculateDdayText = (dateString: string | null) => {
    if (!dateString) return '-';
    const target = new Date(dateString);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>대시보드</h1>
          
          {/* 요약 박스 (3개 가로 배치) */}
          <div className={styles.summaryContainer}>
            <div className={styles.summaryBox}>
              <span className={styles.summaryTitle}>참여 중인 이벤트</span>
              <span className={styles.summaryContent}>{summaryData.ongoingCourseCount}개</span>
            </div>
            <div className={styles.summaryBox}>
              <span className={styles.summaryTitle}>리뷰를 기다리는 이벤트</span>
              <span className={styles.summaryContent}>{summaryData.pendingReviewCount}개</span>
            </div>
            <div className={styles.summaryBox}>
              <span className={styles.summaryTitle}>획득한 배지</span>
              <span className={styles.summaryContent}>{summaryData.earnedBadgeCount}개</span>
            </div>
          </div>
          
          {/* Category Tab */}
          <Tabs
            variant="line"
            options={TAB_OPTIONS}
            activeValue={activeTab}
            onChange={setActiveTab}
          />

          <div className={styles.tableSection}>
            {isLoadingEvents ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280' }}>
                데이터를 불러오는 중...
              </div>
            ) : events.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280' }}>
                해당하는 일정이 없습니다.
              </div>
            ) : activeTab === 'resume' ? (
              <Table columns="1fr 120px 180px 120px">
                <TableHeader>
                  <TableCell header>이벤트 명</TableCell>
                  <TableCell header>호스트</TableCell>
                  <TableCell header>진행 시간</TableCell>
                  <TableCell header></TableCell>
                </TableHeader>
                {events.map((event: DashboardEventItem) => (
                  <TableRow key={event.orderId}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>{formatDateTime(event.startDate)}</TableCell>
                    <TableCell>
                      <Button variant="primary" onClick={() => router.push(`/events/${event.eventId}`)}>
                        입장하기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            ) : (
              <Table columns="1fr 120px 180px 88px">
                <TableHeader>
                  <TableCell header>이벤트 명</TableCell>
                  <TableCell header>호스트</TableCell>
                  <TableCell header>일시</TableCell>
                  <TableCell header>상태</TableCell>
                </TableHeader>
                {events.map((event: DashboardEventItem) => (
                  <TableRow key={event.orderId}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>{formatDateTime(event.startDate)}</TableCell>
                    <TableCell>
                      <span style={{ color: '#172554', fontWeight: 600 }}>
                        {calculateDdayText(event.startDate)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
