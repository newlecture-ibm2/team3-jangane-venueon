'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { StatsCards, TrendCharts } from './_components';

/**
 * 어드민 대시보드 리뉴얼 (기존 스타일 유지 버전)
 * - 좌측 사이드바 레이아웃 유지
 * - 상단 통계 카드 유지
 * - 하단 테이블(ActivityTable)을 트렌드 차트(TrendCharts)로 교체
 */
export default function AdminDashboardPage() {
  return (
    <div className="container-sidebar">
      {/* 1. 사이드바 복구 */}
      <Sidebar role="admin" />

      {/* 우측 메인 콘텐츠 */}
      <section className="sidebar-content">
        
        {/* 대시보드 타이틀 */}
        <h1 className={styles.pageTitle}>관리자 대시보드</h1>

        {/* 요약 카드 섹션 (기존 스타일) */}
        <div style={{ marginTop: '24px' }}>
          <StatsCards />
        </div>

        {/* 트렌드 분석 섹션 (테이블 대신 차트 배치) */}
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h3>서비스 성장 추이</h3>
            <p>최근 7일간의 신규 유저 및 이벤트 데이터 분석</p>
          </div>
          <TrendCharts />
        </div>
        
      </section>
    </div>
  );
}
