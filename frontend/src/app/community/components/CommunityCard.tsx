'use client';

import React from 'react';
import styles from './CommunityCard.module.css';
import { Button } from '@/components/ui';
import { CompanyIcon, CalendarIcon, LocationIcon } from '@/components/icons';

export interface CommunityCardProps {
  postType?: string;
  timeAgo?: string;
  title: string;
  organizer?: string;
  dateTime?: string;
  location?: string;
  actionButtonText?: string;
  onActionClick?: () => void;
}

export default function CommunityCard({
  postType,
  timeAgo,
  title,
  organizer,
  dateTime,
  location,
  actionButtonText,
  onActionClick
}: CommunityCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          {postType && (
            <div className={styles.postType}>
               {/* 뱃지가 필요한 경우 postTypeDot 사용, 현재 디자인은 그대로 유지 */}
              <span className={styles.postTypeDot} />
              {postType}
            </div>
          )}
          {timeAgo && <div className={styles.timeAgo}>{timeAgo}</div>}
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
