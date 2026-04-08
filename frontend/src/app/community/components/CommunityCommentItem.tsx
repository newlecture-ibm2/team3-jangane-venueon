'use client';

import React, { useState } from 'react';
import styles from './CommunityCommentItem.module.css';
import { UserProfile, PopoverMenu } from '@/components/ui';
import type { PopoverMenuItem } from '@/components/ui/PopoverMenu';
import { MoreIcon } from '@/components/icons';

export interface CommunityCommentItemProps {
  /** 작성자 이름 */
  username: string;
  /** 작성 날짜 (예: "2026.03.30 / 10:35") */
  date: string;
  /** 댓글 내용 */
  content: string;
  /** 프로필 이미지 URL (없으면 기본 배경색 원) */
  avatarUrl?: string;
  /** 더보기 메뉴 항목 목록 ..*/
  menuItems?: PopoverMenuItem[];
  /** 더보기 메뉴 항목 선택 시 콜백 */
  onMenuSelect?: (value: string) => void;
  /** 좋아요 수 */
  likeCount?: number;
  /** 좋아요 클릭 시 콜백 */
  onLike?: () => void;
}

export default function CommunityCommentItem({
  username,
  date,
  content,
  avatarUrl,
  menuItems,
  onMenuSelect,
  likeCount = 0,
  onLike,
}: CommunityCommentItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <UserProfile name={username} imageUrl={avatarUrl} size="large" />
          <span className={styles.date}>{date}</span>
        </div>

        {menuItems && menuItems.length > 0 && (
          <div className={styles.moreWrapper}>
            <button
              className={styles.moreButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="더보기"
              type="button"
            >
              <MoreIcon />
            </button>
            {isMenuOpen && (
              <PopoverMenu
                items={menuItems}
                onSelect={(value) => {
                  onMenuSelect?.(value);
                  setIsMenuOpen(false);
                }}
                onClose={() => setIsMenuOpen(false)}
                width={120}
                style={{ top: '100%', right: 0, marginTop: '4px' }}
              />
            )}
          </div>
        )}
      </div>

      <p className={styles.content}>{content}</p>

      <div className={styles.footer}>
        <button 
          className={styles.likeButton} 
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          type="button"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill={likeCount > 0 ? "#EF4444" : "none"} 
            stroke={likeCount > 0 ? "#EF4444" : "#9CA3AF"} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className={likeCount > 0 ? styles.activeLikeCount : styles.likeCount}>{likeCount}</span>
        </button>
        <button className={styles.replyButton} type="button">답글 달기</button>
      </div>
    </div>
  );
}
