import React from 'react';
import styles from './Tag.module.css';

export interface TagProps {
  // 의미론적(Semantic) 색상 배지 지정
  variant?: 'red' | 'purple' | 'green' | 'gray';
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ variant = 'gray', children, className = '' }: TagProps) {
  // variant 이름이 그대로 styles 객체의 클래스 이름(red, purple 등)으로 매핑됩니다.
  return (
    <span className={`${styles.tag} ${styles[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
