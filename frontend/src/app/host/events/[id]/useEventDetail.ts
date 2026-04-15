export interface SessionDetail {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  status: { id: number; label: string } | null;
  communityId: number | null;
}

export interface HostEventDetail {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: { id: number; label: string } | null;
  status: { id: number; label: string } | null;
  recruitmentStatus: { id: number; label: string } | null;
  createdAt: string;
  totalRevenue: number;
  totalAttendees: number;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  location: string;
  hostName: string;
  hostDescription: string | null;
  hostProfileImg: string | null;
  sessions: SessionDetail[];
}

export interface Attendee {
  id: number;
  userName: string;
  email: string;
  phone: string;
  sessionTitle: string;
  paidAmount: number;
  status: string;
  createdAt: string;
}

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<HostEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const response = await api.get<{ status: string; data: HostEventDetail }>(`/host/events/${eventId}`);
        if (response.data) {
          setEvent(response.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch event detail:', err);
        setError('강의 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchDetail();
  }, [eventId]);

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const fetchAttendees = async () => {
    setLoadingAttendees(true);
    try {
      const response = await api.get<{ status: string; data: Attendee[] }>(`/host/events/${eventId}/attendees`);
      if (response.data) setAttendees(response.data);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  return {
    event,
    loading,
    error,
    attendees,
    loadingAttendees,
    fetchAttendees
  };
}
