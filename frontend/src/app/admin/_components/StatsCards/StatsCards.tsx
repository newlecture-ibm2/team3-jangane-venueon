import styles from './StatsCards.module.css';
import { AdminSummaryResponse } from '@/lib/admin-api';

interface StatsCardsProps {
  data: AdminSummaryResponse | null;
  isLoading: boolean;
}

export default function StatsCards({ data, isLoading }: StatsCardsProps) {
  const statsData = [
    { label: '주최자 신규 가입', count: data?.newHostCount ?? 0 },
    { label: '사용자 신규 가입', count: data?.newUserCount ?? 0 },
    { label: '오늘 개설된 이벤트 수', count: data?.newEventCount ?? 0 },
  ];

  if (isLoading) {
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
