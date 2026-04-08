'use client';

import React from 'react';
import styles from './CommunityCard.module.css';
import { Button } from '@/components/ui';

export interface CommunityCardProps {
  postType?: string;
  timeAgo?: string;
  title: string;
  tagSectionTitle?: string;
  categories?: string[];
  actionButtonText?: string;
  onActionClick?: () => void;
}

export default function CommunityCard({
  postType,
  timeAgo,
  title,
  tagSectionTitle,
  categories = [],
  actionButtonText,
  onActionClick
}: CommunityCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          {postType && (
            <div className={styles.postType}>
              <span className={styles.postTypeDot} />
              {postType}
            </div>
          )}
          {timeAgo && <div className={styles.timeAgo}>{timeAgo}</div>}
        </div>
        <h3 className={styles.title} title={title}>{title}</h3>
      </div>

      {categories.length > 0 && (
        <div className={styles.bottomSection}>
          <div className={styles.divider} />
          {tagSectionTitle && (
            <div className={styles.tagSectionTitle}>{tagSectionTitle}</div>
          )}
          <div className={styles.categorySection}>
            {categories.map((category, index) => (
              <div key={index} className={styles.categoryTag}>
                {category}
              </div>
            ))}
          </div>
        </div>
      )}

      {actionButtonText && (
        <div className={styles.actionWrapper}>
          <Button variant="primary" style={{ width: '100%', height: '48px' }} onClick={onActionClick}>
            {actionButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}
