'use client';

import React from 'react';
import styles from './CommunityPostItem.module.css';
import { UserProfile } from '@/components/ui';

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
  /** 상단 고정 여부 */
  isPinned?: boolean;
  /** 공지 여부 */
  isNotice?: boolean;
  /** 게시글 타입 (말머리) */
  type?: string;
}

export default function CommunityPostItem({
  title,
  username,
  date,
  avatarUrl,
  selected = false,
  onClick,
  isPinned = false,
  isNotice = false,
  type = 'FREE',
}: CommunityPostItemProps) {
  const rootClass = selected
    ? `${styles.item} ${styles.selected}`
    : styles.item;

  return (
    <div className={rootClass} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.titleWrapper}>
        {isNotice && (
          <span className={styles.noticeBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
            공지
          </span>
        )}
        {isPinned && !isNotice && (
          <span className={styles.pinBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.79-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.79.9A2 2 0 0 0 5 15.24Z" />
            </svg>
            고정
          </span>
        )}
        <div className={styles.titleRow}>
          <span className={styles.postType}>[{
            type === 'NOTICE' ? '공지' : 
            type === 'FREE' ? '자유' : 
            type === 'QUESTION' ? '질문' : 
            type === 'INFO' ? '정보' : '일반'
          }]</span>
          <p className={styles.title}>{title}</p>
        </div>
      </div>

      <div className={styles.meta}>
        <UserProfile name={username} imageUrl={avatarUrl} size="medium" />
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
}
