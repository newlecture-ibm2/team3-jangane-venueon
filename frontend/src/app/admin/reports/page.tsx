'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import dynamic from 'next/dynamic';

const ReportTable = dynamic(() => import('./_components/ReportTable'), {
  ssr: false,
});

export default function AdminReportsPage() {
  return (
    <div className="container-sidebar">
      {/* 사이드바 */}
      <Sidebar role="admin" />

      {/* 우측 메인 콘텐츠 */}
      <section className="sidebar-content">
        <h1 className={styles.pageTitle}>신고 관리</h1>

        <div className={styles.tableSection}>
          <ReportTable />
        </div>
      </section>
    </div>
  );
}
