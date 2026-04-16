import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

export interface OnlineSessionInfo {
  sessionId: number;
  title: string;
  startTime: string;
  endTime: string;
  onlineLink: string;
  isLive: boolean;
}

export interface OrderDetailResponse {
  orderId: number;
  eventId: number;
  eventTitle: string;
  ticketName: string;
  ticketPrice: number;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  orderedAt: string;
  paidAt: string | null;
  organizer: string;
  location: string;
  eventStatus: {
    id: number;
    label: string;
  };
  onlineSessions?: OnlineSessionInfo[];
}

export function useOrderDetail() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useUIStore();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
      } else {
        showToast('오류', 'error', '결제 상세 내역을 불러오는데 실패했습니다.');
        router.push('/mypage/orders');
      }
    } catch (err) {
      console.error(err);
      showToast('오류', 'error', '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [orderId, router, showToast]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const submitRefund = async (reason: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        showToast('환불 제출 완료', 'success', '환불 신청이 완료되었습니다.');
        setIsRefundModalOpen(false);
        fetchOrderDetail(); // 데이터 리프레시
      } else {
        const errorData = await res.json();
        showToast('환불 신청 실패', 'error', errorData.message || '환불 신청 중 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
      showToast('통신 오류', 'error', '서버와의 통신에 실패했습니다.');
    }
  };

  return {
    order,
    loading,
    isRefundModalOpen,
    setIsRefundModalOpen,
    submitRefund,
    router
  };
}
