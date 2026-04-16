'use client';

import React from 'react';
import { ReviewItem } from '@/components/ui';
import { useUIStore } from '@/store/useUIStore';
import styles from './ReviewSection.module.css';
import { useEventReviews } from './useEventReviews';

interface EventReviewSectionProps {
  eventId: number;
  eventTitle: string;
}

export default function ReviewSection({ eventId, eventTitle }: EventReviewSectionProps) {
  const { showToast } = useUIStore();
  const { reviews } = useEventReviews(eventId);



  return (
    <>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          참석자 후기 <span className={styles.count}>{reviews.length}</span>
        </h3>
      </div>

      <div className={styles.reviewList}>
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <ReviewItem key={r.id} {...r} />
          ))
        ) : (
          <div className={styles.emptyState}>
            아직 등록된 후기가 없습니다. 첫 후기를 남겨주세요!
          </div>
        )}
      </div>
    </>
  );
}
