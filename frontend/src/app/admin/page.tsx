'use client';

import React from 'react';
import styles from './page.module.css';
import { TrendCharts, NavigationGrid } from './_components';

/**
 * 신규 어드민 커맨드 센터 (대시보드)
 * - 사이드바 제거: 대시보드에서는 모든 기능을 카드 기반 네비게이션으로 제공
 * - 데이터 시각화: 유저, 호스트, 이벤트 추이를 한눈에 파악
 * - 직관적 UI: 큼직한 카드를 클릭하여 각 관리 페이지(Users, Events 등)로 이동
 */
export default function AdminDashboardPage() {
  return (
    <main className={styles.mainContainer}>
      <div className={styles.content}>
        
        {/* 1. 상단 인트로 섹션 */}
        <header className={styles.heroHeader}>
          <div className={styles.badge}>ADMIN CENTER</div>
          <h1 className={styles.pageTitle}>환영합니다, 관리자님</h1>
          <p className={styles.subtitle}>
            오늘의 서비스 한눈에 보기. 유입 및 활동 추이를 분석하고 시스템을 관리하세요.
          </p>
        </header>

        {/* 2. 트렌드 분석 섹션 (그래프) */}
        <section className={styles.analyticsSection}>
          <TrendCharts />
        </section>

        {/* 3. 명렁 센터 섹션 (버튼형 네비게이션) */}
        <section className={styles.navigationSection}>
          <div className={styles.sectionHeader}>
            <h2>시스템 제어판</h2>
            <p>각 카테고리를 클릭하여 세부 관리 페이지로 이동합니다.</p>
          </div>
          <NavigationGrid />
        </section>
        
      </div>
    </main>
  );
}
