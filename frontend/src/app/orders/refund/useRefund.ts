import { useState, useEffect } from 'react';

export interface OrderItem {
  orderId: number;
  eventId: number;
  eventTitle: string;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  orderedAt: string;
  paidAt: string | null;
}

export function useRefund() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/me?page=0&size=50');
      if (!res.ok) throw new Error('주문 목록을 불러올 수 없습니다.');
      const json = await res.json();
      const content = json.data?.content || json.data || [];
      setOrders(Array.isArray(content) ? content : []);
    } catch (err) {
      console.error('주문 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${cancelTarget.orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || '환불 요청에 실패했습니다.');
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === cancelTarget.orderId ? { ...o, status: 'REFUNDED' } : o
        )
      );
      setCancelTarget(null);
      setToast({ title: '환불 완료', message: `${cancelTarget.eventTitle} 수강이 취소되었습니다.` });
      setTimeout(() => setToast(null), 4000);

    } catch (err: any) {
      alert(err.message || '환불 처리 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  return {
    orders,
    loading,
    cancelling,
    cancelTarget,
    setCancelTarget,
    toast,
    handleCancelConfirm
  };
}
