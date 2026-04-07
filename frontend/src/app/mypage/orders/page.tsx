'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
// 만약 프로필 쪽 CSS를 재사용하고 싶다면 아래와 같이 씁니다
import styles from '../profile/page.module.css';

export default function OrdersPage() {
  return (
    <div className="container-sidebar">
      {/* Sidebar: role="user" */}
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>결제 내역</h1>

          {/* 여기에 결제 내역 전용 리스트 컴포넌트나 Card를 배치하시면 됩니다. */}
          <div className={styles.profileSection} style={{ maxWidth: '100%' }}>
            <p style={{ color: 'var(--color-text-gray-500)' }}>
              결제하신 내역이 없습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
