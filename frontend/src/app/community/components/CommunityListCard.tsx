'use client';

import React from 'react';
import styles from './CommunityListCard.module.css';
import { Tag, Button, StatusTag } from '@/components/ui';
import { CompanyIcon, CalendarIcon, LocationIcon, EditIcon } from '@/components/icons';

export interface CommunityListCardProps {
  status?: string;
  tagText?: string;
  tagVariant?: 'red' | 'purple' | 'green' | 'gray';
  title: string;
  imageUrl?: string;
  organizer: string;
  dateTime: string;
  location: string;
  price: string | number;
  actionButtonText?: string;
  onActionClick?: () => void;
  onEditClick?: () => void;
}

export default function CommunityListCard({
  status,
  tagText,
  tagVariant = 'gray',
  title,
  imageUrl,
  organizer,
  dateTime,
  location,
  price,
  actionButtonText,
  onActionClick,
  onEditClick
}: CommunityListCardProps) {

  const formattedPrice = price === 0 
    ? '무료' 
    : typeof price === 'number' 
      ? `₩${price.toLocaleString()}`
      : price;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          {tagText ? (
            <Tag variant={tagVariant}>{tagText}</Tag>
          ) : status ? (
            <StatusTag domain="course" status={status} />
          ) : (
            <div />
          )}

          <div className={styles.topRight}>
            {onEditClick && (
              <button 
                type="button" 
                className={styles.editIconButton} 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditClick();
                }}
                title="정보 수정"
              >
                <EditIcon width={20} height={20} />
              </button>
            )}
          </div>
        </div>
        <h3 className={styles.title} title={title}>{title}</h3>
      </div>

      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.image} />
        ) : null}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <CompanyIcon className={styles.infoIcon} />
          <span className={styles.infoText}>{organizer}</span>
        </div>
        <div className={styles.infoRow}>
          <CalendarIcon className={styles.infoIcon} />
          <span className={styles.infoText}>{dateTime}</span>
        </div>
        <div className={styles.infoRow}>
          <LocationIcon className={styles.infoIcon} />
          <span className={styles.infoText}>{location}</span>
        </div>
      </div>

      <div className={styles.priceSection}>
        <span className={styles.price}>{formattedPrice}</span>
      </div>

      {actionButtonText && (
        <div className={styles.actionWrapper}>
          <Button variant="primary" style={{ flex: 1, height: '48px', padding: 0 }} onClick={onActionClick}>
            {actionButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}
