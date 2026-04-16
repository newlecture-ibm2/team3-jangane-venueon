import { useState, useEffect, useCallback } from 'react';

export interface LectureItem {
  orderId: number;
  status: string;
  title: string;
  organizer: string;
  dateTime: string;
  location: string;
  price: number;
  eventId: number;
  thumbnailUrl?: string;
  categoryId?: number;
  hasOnlineSessions: boolean;
}

const ITEMS_PER_PAGE = 8; // 2열 × 4줄

export function useEvents() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);

  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 리뷰 모달 상태
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ eventId: number; title: string } | null>(null);

  // 이미 리뷰를 작성한 이벤트 ID 추적
  const [reviewedSet, setReviewedSet] = useState<Set<number>>(new Set());

  // 백엔드 API 호출
  const fetchOrders = useCallback(async (tab: string, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/me?tab=${tab}&page=${page - 1}&size=${ITEMS_PER_PAGE}`
      );
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        const validLectures = (data.content || []).filter(
          (item: any) => item.status === 'PAID' || item.status === 'REGISTERED' || item.status === 'PENDING'
        );
        const mappedLectures: LectureItem[] = validLectures.map((item: any) => ({
          orderId: item.orderId,
          eventId: item.eventId,
          title: item.eventTitle,
          status: item.eventStatus?.label || item.status,
          organizer: item.organizer || "알 수 없는 호스트",
          dateTime: item.eventStartDate ? new Date(item.eventStartDate).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }) : "-",
          location: item.location || "-",
          price: item.amount,
          thumbnailUrl: item.thumbnailUrl || undefined,
          categoryId: item.categoryId || undefined,
          hasOnlineSessions: item.hasOnlineSessions || false,
        }));
        setLectures(mappedLectures);
        setTotalPages(data.totalPages || 1);

        // 종료 탭일 때 각 이벤트의 리뷰 작성 여부 확인
        if (tab === 'completed') {
          const eventIds = [...new Set(mappedLectures.map(l => l.eventId))];
          const reviewed = new Set<number>();
          await Promise.all(
            eventIds.map(async (eid) => {
              try {
                const rRes = await fetch(`/api/events/${eid}/reviews/can-review`);
                const rData = await rRes.json();
                // can-review가 false면 이미 리뷰를 작성한 것
                if (rData.success && rData.data === false) {
                  reviewed.add(eid);
                }
              } catch { /* ignore */ }
            })
          );
          setReviewedSet(reviewed);
        }

        // Fetch wishlist IDs
        try {
          const wlRes = await fetch('/api/wishlists/me?size=100');
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            if (wlData.data && wlData.data.content) {
              const ids = new Set<number>(wlData.data.content.map((item: any) => item.id));
              setWishlistSet(ids);
            }
          }
        } catch (e) {
          // ignore
        }
      } else {
        setLectures([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLectures([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // 탭 또는 페이지 변경 시 API 재호출
  useEffect(() => {
    fetchOrders(activeTab, currentPage);
  }, [activeTab, currentPage, fetchOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // 리뷰 작성 가능 여부 판단
  const canWriteReview = (eventId: number) => {
    return activeTab === 'completed' && !reviewedSet.has(eventId);
  };

  const openReviewModal = (eventId: number, title: string) => {
    setReviewTarget({ eventId, title });
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleReviewSuccess = () => {
    setReviewModalOpen(false);
    if (reviewTarget) {
      setReviewedSet(prev => new Set(prev).add(reviewTarget.eventId));
    }
    setReviewTarget(null);
  };

  return {
    activeTab,
    currentPage,
    totalPages,
    lectures,
    loading,
    wishlistSet,
    reviewModalOpen,
    reviewTarget,
    handleTabChange,
    handlePageChange,
    canWriteReview,
    openReviewModal,
    closeReviewModal,
    handleReviewSuccess,
  };
}
