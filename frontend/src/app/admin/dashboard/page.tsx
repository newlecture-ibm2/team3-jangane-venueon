'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import StatsCards from '../_components/StatsCards';
import ActivityTable from '../_components/ActivityTable';

export default function AdminDashboardPage() {
  return (
    <div className="container-sidebar">
      {/* 1. 사이드바 */}
      <Sidebar role="admin" />

      {/* 우측 메인 콘텐츠 */}
      <section className="sidebar-content">
        
        {/* 가이드에 명시된 대시보드 타이틀 추가 */}
        <h1 className={styles.pageTitle}>관리자 대시보드</h1>

        {/* 요약 카드 */}
        <div style={{ marginTop: '24px' }}>
          <StatsCards />
        </div>

        {/* 활동 테이블 (상단 검색바 및 탭 포함) */}
        <div className={styles.activitySection}>
          <ActivityTable />
        </div>
        
      </section>
    </div>
  );
}
