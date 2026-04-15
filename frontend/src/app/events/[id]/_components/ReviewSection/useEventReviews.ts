import { useState, useEffect } from 'react';

export function useEventReviews(eventId: number) {
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

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  return { reviews };
}
