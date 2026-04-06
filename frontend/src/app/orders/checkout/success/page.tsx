"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../checkout.module.css';
import { Button } from '@/components/ui';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('결제를 승인하는 중입니다...');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const tossOrderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      const orderId = searchParams.get('orderId')?.match(/venueon_order_(\d+)_/)?.[1]
        || new URLSearchParams(window.location.search).get('orderId');

      // orderId가 URL에 별도 파라미터로 오는 경우 (우리 커스텀 파라미터)
      const backendOrderId = new URLSearchParams(window.location.hash || window.location.search).get('orderId');

      if (!paymentKey || !tossOrderId || !amount) {
        setStatus('error');
        setMessage('결제 정보가 올바르지 않습니다.');
        return;
      }

      // tossOrderId에서 백엔드 orderId 추출: venueon_order_{id}_{timestamp}
      const match = tossOrderId.match(/venueon_order_(\d+)_/);
      const extractedOrderId = match ? match[1] : backendOrderId;

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
        setMessage(err.message || '결제 승인 중 오류가 발생했습니다.');
      }
    };

    confirmPayment();
  }, [searchParams]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  return (
    <div className="container-single">
      <div className={styles.checkoutCard}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {status === 'loading' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ marginBottom: '16px' }}>{message}</h2>
              {paymentInfo && (
                <div style={{ textAlign: 'left', margin: '24px 0', padding: '16px', background: 'var(--color-gray-50, #f9fafb)', borderRadius: '8px' }}>
                  <p><strong>주문 번호:</strong> {paymentInfo.orderId}</p>
                  <p><strong>결제 금액:</strong> {formatPrice(paymentInfo.amount)}</p>
                  <p><strong>결제 수단:</strong> {paymentInfo.paymentMethod}</p>
                  <p><strong>결제 상태:</strong> {paymentInfo.status}</p>
                </div>
              )}
              <Button
                variant="primary"
                size="large"
                onClick={() => window.location.href = '/orders'}
              >
                주문 내역으로 이동
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
              <h2 style={{ marginBottom: '16px', color: 'var(--color-error)' }}>결제 실패</h2>
              <p style={{ marginBottom: '24px' }}>{message}</p>
              <Button
                variant="primary"
                size="large"
                onClick={() => window.history.back()}
              >
                다시 시도하기
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
