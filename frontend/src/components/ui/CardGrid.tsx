'use client';

import React from 'react';
import styles from './CardGrid.module.css';

export interface CardGridProps {
  /** 카드 정렬: 2줄(sidebar 페이지용) 또는 3줄(메인 페이지용) */
  layout?: '2-cols' | '3-cols';
  children: React.ReactNode;
  className?: string;
}

export default function CardGrid({
  layout = '3-cols',
  children,
  className = ''
}: CardGridProps) {
  const colClass = layout === '2-cols' ? styles.twoCols : styles.threeCols;

  return (
    <div className={`${styles.grid} ${colClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
