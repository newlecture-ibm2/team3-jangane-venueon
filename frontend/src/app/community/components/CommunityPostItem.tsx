'use client';

import React from 'react';
import styles from './CommunityPostItem.module.css';
import UserProfile from './UserProfile';

export interface CommunityPostItemProps {
  /** 게시글 제목 */
  title: string;
  /** 작성자 이름 */
  username: string;
  /** 작성 날짜 (예: "2026.03.30 / 10:35") */
  date: string;
  /** 프로필 이미지 URL (없으면 기본 배경색 원) */
  avatarUrl?: string;
  /** 선택 상태 */
  selected?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

export default function CommunityPostItem({
  title,
  username,
  date,
  avatarUrl,
  selected = false,
  onClick,
}: CommunityPostItemProps) {
  const rootClass = selected
    ? `${styles.item} ${styles.selected}`
    : styles.item;

  return (
    <div className={rootClass} onClick={onClick} role="button" tabIndex={0}>
      <p className={styles.title}>{title}</p>

      <div className={styles.meta}>
        <UserProfile name={username} imageUrl={avatarUrl} size="medium" />
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
}
