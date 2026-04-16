'use client';

import React from 'react';
import styles from './CommunityCard.module.css';
import { Button } from '@/components/ui';
import { CompanyIcon, CalendarIcon, LocationIcon } from '@/components/icons';
import { formatDistanceToNowStrict } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface CommunityCardProps {
  category?: string;
  postType?: string; // fallback for backwards compatibility
  timeAgo?: string;  // fallback string
  createdAt?: string | Date; // NEW: used to compute relative time
  title: string;
  organizer?: string;
  dateTime?: string;
  location?: string;
  actionButtonText?: string;
  onActionClick?: () => void;
}

export default function CommunityCard({
  category,
  postType,
  timeAgo,
  createdAt,
  title,
  organizer,
  dateTime,
  location,
  actionButtonText,
  onActionClick
}: CommunityCardProps) {
  const displayCategory = category || postType;

  let displayTimeAgo = timeAgo;
  if (createdAt) {
    try {
      const distance = formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true, locale: ko });
      displayTimeAgo = distance === '0초 전' ? '방금 전' : distance;
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          {displayCategory && (
            <div className={styles.postType}>
              <span className={styles.postTypeDot} />
              {displayCategory}
            </div>
          )}
          {displayTimeAgo && <div className={styles.timeAgo}>{displayTimeAgo}</div>}
        </div>
        <h3 className={styles.title} title={title}>{title}</h3>
      </div>

      {(organizer || dateTime || location) && (
        <div className={styles.bottomSection}>
          <div className={styles.divider} />
          <div className={styles.infoSection}>
            {organizer && (
              <div className={styles.infoRow}>
                <CompanyIcon className={styles.infoIcon} />
                <span className={styles.infoText}>{organizer}</span>
              </div>
            )}
            {dateTime && (
              <div className={styles.infoRow}>
                <CalendarIcon className={styles.infoIcon} />
                <span className={styles.infoText}>{dateTime}</span>
              </div>
            )}
            {location && (
              <div className={styles.infoRow}>
                <LocationIcon className={styles.infoIcon} />
                <span className={styles.infoText}>{location}</span>
              </div>
            )}
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
