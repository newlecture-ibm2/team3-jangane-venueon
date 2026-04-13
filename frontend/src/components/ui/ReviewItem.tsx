'use client';

import React from 'react';
import styles from './ReviewItem.module.css';
import { UserProfile } from '@/components/ui';
import { ReviewStarIcon } from '@/components/icons';

export interface ReviewItemProps {
  id?: number;
  authorName: string;
  authorProfileUrl?: string;
  rating: number; // 별점 (1~5)
  date: string;
  content: string;
  images?: string[]; 
}

export default function ReviewItem({
  authorName,
  authorProfileUrl,
  rating,
  date,
  content,
  images = [],
}: ReviewItemProps) {
  // 별점은 1~5점 사이로 고정
  const safeRating = Math.max(0, Math.min(5, Math.ceil(rating)));

  return (
    <div className={styles.container}>
      {/* 헤더: 작성자 프로필 + 날짜 */}
      <div className={styles.header}>
        <UserProfile name={authorName} imageUrl={authorProfileUrl} size="medium" />
        <span className={styles.date}>{date}</span>
      </div>

      {/* 별점 */}
      <div className={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <ReviewStarIcon
            key={star}
            className={`${styles.star} ${star <= safeRating ? styles.starFilled : ''}`}
            fill={star <= safeRating ? 'currentColor' : 'none'}
          />
        ))}
      </div>

      {/* 리뷰 내용 */}
      <p className={styles.content}>{content}</p>

      {/* 첨부 이미지 목록 (있는 경우에만 렌더링) */}
      {images && images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((src, idx) => (
            <div key={idx} className={styles.imageWrapper}>
              <img src={src} alt={`리뷰 첨부사진 ${idx + 1}`} className={styles.image} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
