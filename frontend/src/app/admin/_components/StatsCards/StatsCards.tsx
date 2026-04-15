'use client';

import React, { useEffect, useState } from 'react';
import styles from './StatsCards.module.css';
import { adminSummaryAPI, AdminSummaryResponse } from '@/lib/admin-api';

export default function StatsCards() {
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 백엔드에서 실시간 통계 데이터 가져오기 (표준 API 활용)
    const fetchSummary = async () => {
      try {
        const response = await adminSummaryAPI.getSummary();
        
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("대시보드 요약 정보를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const statsData = [
    { label: '주최자 신규 가입', count: data?.newHostCount ?? 0 },
    { label: '사용자 신규 가입', count: data?.newUserCount ?? 0 },
    { label: '오늘 개설된 이벤트 수', count: data?.newEventCount ?? 0 },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${styles.card} ${styles.skeleton}`}>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonValue}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {statsData.map((item, index) => (
        <div key={index} className={styles.card}>
          <p className={styles.label}>{item.label}</p>
          <h2 className={styles.count}>{item.count}</h2>
        </div>
      ))}
    </div>
  );
}
