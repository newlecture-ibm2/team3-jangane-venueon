import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  type: string;
  status: { id: number; label: string };
  recruitmentStatus: { id: number; label: string };
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  startDate: string;
  endDate: string;
  location: string;
  hostName?: string;
}

export interface PageData {
  content: EventData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function useHostEvents() {
  const [eventsData, setEventsData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const fetchEvents = useCallback(async (status: string, page: number = 0) => {
    setLoading(true);
    try {
      let endpoint = `/host/events?page=${page}&size=10`;
      if (status === 'DRAFT') {
        endpoint = `/host/events/drafts?page=${page}&size=10`;
      } else if (status !== 'ALL') {
        endpoint += `&status=${status}`;
      }
      
      const res = await api.get<{ status: string; data: PageData }>(endpoint);
      setEventsData(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (eventsData && newPage >= 0 && newPage < eventsData.totalPages) {
      fetchEvents(activeTab, newPage);
    }
  }, [eventsData, activeTab, fetchEvents]);

  return {
    eventsData,
    loading,
    activeTab,
    setActiveTab,
    fetchEvents,
    handlePageChange
  };
}
