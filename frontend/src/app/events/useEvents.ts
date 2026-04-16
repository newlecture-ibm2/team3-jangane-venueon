import { useState, useCallback } from 'react';

interface EventData {
  id: number;
  title: string;
  thumbnailUrl: string;
  type: { id: number; label: string };
  status: { id: number; label: string };
  recruitmentStatus: { id: number; label: string } | null;
  location: string;
  isOnline: boolean;
  price: number;
  maxAttendees: number;
  startDate: string | null;
  endDate: string | null;
  categoryId: number;
  creatorId: number;
  recruitStartDate?: string;
  recruitEndDate?: string;
}

export function useEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchEvents = useCallback(async (page: number, keyword: string = '') => {
    setLoading(true);
    try {
      let url = `/api/events?page=${page - 1}&size=12&sort=latest`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      const res = await fetch(url);
      const resData = await res.json();

      if (resData.success) {
        setEvents(resData.data.content);
        setTotalPages(resData.data.totalPages);
      } else {
        console.error('Failed to fetch events:', resData.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    fetchEvents
  };
}
