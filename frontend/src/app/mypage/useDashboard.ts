import { useState, useEffect, useCallback } from 'react';

export interface SummaryData {
  ongoingCourseCount: number;
  pendingReviewCount: number;
  earnedBadgeCount: number;
}

export interface DashboardEventItem {
  orderId: number;
  eventId: number;
  title: string;
  organizer: string;
  startDate: string | null;
  status: string;
}

export function useDashboard() {
  const [activeTab, setActiveTab] = useState('resume');
  const [summaryData, setSummaryData] = useState<SummaryData>({
    ongoingCourseCount: 0,
    pendingReviewCount: 0,
    earnedBadgeCount: 0,
  });

  const [events, setEvents] = useState<DashboardEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // 요약 데이터 조회
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/mypage/summary');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setSummaryData(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
      }
    };

    fetchSummary();
  }, []);

  // 탭(진행 중, 다가오는 일정)에 따른 API 호출
  // 진행 중(resume) -> enrolled
  // 다가오는 일정(schedule) -> upcoming
  const fetchEvents = useCallback(async (tabName: string) => {
    setIsLoadingEvents(true);
    const apiTab = tabName === 'resume' ? 'enrolled' : 'upcoming';
    try {
      // 대시보드는 상위 5~10개만 표시 (목록 페이지 역할이 아니므로 size=10 사용)
      const res = await fetch(`/api/orders/me?tab=${apiTab}&page=0&size=10`);
      if (res.ok) {
        const json = await res.json();
        const content = json.data?.content || [];
        
        const mapped: DashboardEventItem[] = content.map((item: any) => ({
          orderId: item.orderId,
          eventId: item.eventId,
          title: item.eventTitle || '이름 없음',
          organizer: item.organizer || '알 수 없는 호스트',
          startDate: item.eventStartDate || null,
          status: item.eventStatus?.label || item.status,
        }));
        setEvents(mapped);
      } else {
        setEvents([]);
      }
    } catch(err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab, fetchEvents]);

  return {
    activeTab,
    setActiveTab,
    summaryData,
    events,
    isLoadingEvents
  };
}
