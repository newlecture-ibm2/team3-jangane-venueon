'use client';

import React from 'react';
import styles from './Card.module.css';
import { Tag, Button, StatusTag } from '@/components/ui';
import { CompanyIcon, CalendarIcon, LocationIcon } from '@/components/icons';

export interface CardProps {
  status?: '게시 전' | '모집 중' | '준비 중' | '진행 중' | '종료' | string;
  tagVariant?: 'red' | 'purple' | 'green' | 'gray';
  tagText?: string;
  title: string;
  imageUrl?: string;
  organizer: string;
  dateTime: string;
  location: string;
  price: string | number;
  actionButtonText?: string;
  onActionClick?: () => void;
}

export default function Card({
  status,
  tagText,
  title,
  imageUrl,
  organizer,
  dateTime,
  location,
  price,
  actionButtonText,
  onActionClick
}: CardProps) {


  // 숫자일 경우 ₩ 포맷 변환, 문자열일 경우 그대로 렌더링 (단, 0일 경우 '무료'로 표시)
  const formattedPrice = price === 0 
    ? '무료' 
    : typeof price === 'number' 
      ? `₩${price.toLocaleString()}`
      : price;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {tagText ? (
          <Tag variant="gray">{tagText}</Tag>
        ) : status ? (
          <StatusTag domain="course" status={status} />
        ) : null}
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
          <Button variant="primary" style={{ width: '100%', height: '48px' }} onClick={onActionClick}>
            {actionButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}
