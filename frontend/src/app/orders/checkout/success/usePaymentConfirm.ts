import { useEffect, useState } from 'react';

export function usePaymentConfirm(
  paymentKey: string | null,
  tossOrderId: string | null,
  amount: string | null,
  backendOrderId: string | null
) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('결제를 승인하는 중입니다...');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !tossOrderId || !amount) {
        setStatus('error');
        setMessage('결제 정보가 올바르지 않습니다.');
        return;
      }

      const match = tossOrderId.match(/venueon_order_(\d+)_/);
      let extractedOrderId = backendOrderId || (match ? match[1] : null);

      if (!extractedOrderId) {
        setStatus('error');
        setMessage('주문 ID를 확인할 수 없습니다.');
        return;
      }

      try {
        const res = await fetch(`/api/orders/${extractedOrderId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId: tossOrderId,
            amount: Number(amount),
          }),
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          throw new Error(errorBody?.message || `결제 승인 실패 (${res.status})`);
        }

        const json = await res.json();
        setPaymentInfo(json.data);
        setStatus('success');
        setMessage('결제가 완료되었습니다!');
      } catch (err: any) {
        console.error('결제 승인 에러:', err);
        setStatus('error');

        let friendlyMessage = '결제 승인 중 오류가 발생했습니다.';
        const rawError = err.message || '';

        try {
          const messageMatch = rawError.match(/"message":"([^"]+)"/);
          if (messageMatch && messageMatch[1]) {
            friendlyMessage = messageMatch[1];
          } else if (rawError.includes('ALREADY_PROCESSED_PAYMENT')) {
            friendlyMessage = '이미 처리된 결제입니다.';
          }
        } catch (e) {
        }

        setMessage(friendlyMessage);
      }
    };

    confirmPayment();
  }, [paymentKey, tossOrderId, amount, backendOrderId]);

  return { status, message, paymentInfo };
}
