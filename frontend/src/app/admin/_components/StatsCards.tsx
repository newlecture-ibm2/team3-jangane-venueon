import React from 'react';
import styles from './StatsCards.module.css';

interface StatData {
  title: string;
  value: string;
}

const STATS: StatData[] = [
  { title: '주최자 신규 가입', value: '30' },
  { title: '신규 신고 접수', value: '30' },
  { title: '오늘 개설된 강의 수', value: '30' },
];

export default function StatsCards() {
  return (
    <div className={styles.cardsContainer}>
      {STATS.map((stat, index) => (
        <div key={index} className={styles.card}>
          <h3 className={styles.title}>{stat.title}</h3>
          <p className={styles.value}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
