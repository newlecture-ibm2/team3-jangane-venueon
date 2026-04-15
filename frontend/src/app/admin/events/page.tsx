'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';

// Hydration Mismatch 방지를 위해 Client Side 전용으로 로드
const EventTable = dynamic(() => import('./_components/EventTable'), {
  ssr: false,
});

export default function AdminEventsPage() {
  return (
    <div className="container-sidebar">
      {/* 사이드바 */}
      <Sidebar role="admin" />

      {/* 우측 메인 콘텐츠 */}
      <section className="sidebar-content">
        <h1 className={styles.pageTitle}>강의 관리</h1>

        <div className={styles.tableSection}>
          <EventTable />
        </div>
      </section>
    </div>
  );
}
