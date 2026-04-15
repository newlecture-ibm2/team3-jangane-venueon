'use client';

import React, { useState } from 'react';
import { ReviewItem } from '@/components/ui';
import { useUIStore } from '@/store/useUIStore';

interface EventReviewSectionProps {
  eventId: number;
  eventTitle: string;
}

export default function EventReviewSection({ eventId, eventTitle }: EventReviewSectionProps) {
  const { showToast } = useUIStore();

  const [reviews, setReviews] = useState<any[]>([]);

  // 백엔드 GET /events/{id}/reviews API와 연동
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/reviews`);
      const data = await res.json();
      if (data.success && data.data) {
        setReviews(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, [eventId]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ font: 'var(--text-h2-bold)', color: 'var(--color-text-gray-900)', margin: 0 }}>
          참석자 후기 <span style={{ color: 'var(--color-primary)' }}>{reviews.length}</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <ReviewItem key={r.id} {...r} />
          ))
        ) : (
          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--color-text-gray-500)', background: 'var(--color-text-gray-50)', borderRadius: 'var(--radius-lg)' }}>
            아직 등록된 후기가 없습니다. 첫 후기를 남겨주세요!
          </div>
        )}
      </div>
    </>
  );
}
