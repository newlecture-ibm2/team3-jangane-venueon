'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Tabs, InputField, Table, TableHeader, TableRow, TableCell, StatusTag, Button, Tag } from '@/components/ui';
import styles from './page.module.css';

const TAB_OPTIONS = [
  { value: 'resume', label: '진행 중' },
  { value: 'schedule', label: '다가오는 일정' },
];

interface SummaryData {
  ongoingCourseCount: number;
  pendingReviewCount: number;
  earnedBadgeCount: number;
}

export default function MyPageDashboard() {
  const [activeTab, setActiveTab] = useState('resume');
  const [summaryData, setSummaryData] = useState<SummaryData>({
    ongoingCourseCount: 0,
    pendingReviewCount: 0,
    earnedBadgeCount: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/mypage/summary');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setSummaryData(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
      }
    };

    fetchSummary();
  }, []);

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
          
          {/* Category Tab (lined style) */}
          <Tabs
            variant="line"
            options={TAB_OPTIONS}
            activeValue={activeTab}
            onChange={setActiveTab}
          />

          <div className={styles.tableSection}>
            {/* 검색창 */}
            <InputField
              variant="search"
              className={styles.searchBar}
            />



            {/* "진행 중" 탭 전용 테이블 */}
            {activeTab === 'resume' && (
              <Table columns="1fr 120px 180px 120px">
                <TableHeader>
                  <TableCell header>행사명</TableCell>
                  <TableCell header>호스트</TableCell>
                  <TableCell header>진행 시간</TableCell>
                  <TableCell header></TableCell>
                </TableHeader>
                <TableRow>
                  <TableCell>실전! Spring Boot 백엔드 마스터</TableCell>
                  <TableCell>장안에화제</TableCell>
                  <TableCell>오늘 14:00 - 18:00</TableCell>
                  <TableCell>
                    <Button variant="primary">입장하기</Button>
                  </TableCell>
                </TableRow>
              </Table>
            )}

            {/* "다가오는 일정" 탭 전용 테이블 */}
            {activeTab === 'schedule' && (
              <Table columns="1fr 120px 180px 88px">
                <TableHeader>
                  <TableCell header>이벤트 명</TableCell>
                  <TableCell header>호스트</TableCell>
                  <TableCell header>일시</TableCell>
                  <TableCell header>상태</TableCell>
                </TableHeader>
                <TableRow>
                  <TableCell>스프링 부트 실전 웹 개발 라이브 Q&A</TableCell>
                  <TableCell>장안에화제</TableCell>
                  <TableCell>오늘 오후 8:00</TableCell>
                  <TableCell>D-Day</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>이력서/포트폴리오 단기 피드백</TableCell>
                  <TableCell>김프론트</TableCell>
                  <TableCell>2026.04.12 오후 2:00</TableCell>
                  <TableCell>D-4</TableCell>
                </TableRow>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
