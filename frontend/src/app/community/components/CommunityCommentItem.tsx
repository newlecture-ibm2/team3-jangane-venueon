'use client';

import React, { useState } from 'react';
import styles from './CommunityCommentItem.module.css';
import UserProfile from '@/components/ui/UserProfile';
import PopoverMenu from '@/components/ui/PopoverMenu';
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
  /** 더보기 메뉴 항목 목록 */
  menuItems?: PopoverMenuItem[];
  /** 더보기 메뉴 항목 선택 시 콜백 */
  onMenuSelect?: (value: string) => void;
}

export default function CommunityCommentItem({
  username,
  date,
  content,
  avatarUrl,
  menuItems,
  onMenuSelect,
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
    </div>
  );
}
