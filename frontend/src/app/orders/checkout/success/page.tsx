"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../checkout.module.css';
import successStyles from './success.module.css';
import { Button } from '@/components/ui';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.checkoutContainer}><div className={styles.checkoutCard}><p style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</p></div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
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
        
        let friendlyMessage = '결제 승인 중 오류가 발생했습니다.';
        const rawError = err.message || '';
        
        // 백엔드에서 뱉는 형태: "토스 결제 승인 실패: 400 Bad Request: "{...}"" 에서 메시지 추출
        try {
          const messageMatch = rawError.match(/"message":"([^"]+)"/);
          if (messageMatch && messageMatch[1]) {
            friendlyMessage = messageMatch[1];
          } else if (rawError.includes('ALREADY_PROCESSED_PAYMENT')) {
            friendlyMessage = '이미 처리된 결제입니다.';
          } else {
            // 다른 텍스트만 있다면 그대로 노출 방지(안전을 위해 일반화)
          }
        } catch(e) {
          // 파싱 실패시 기본 메시지
        }
        
        setMessage(friendlyMessage);
      }
    };

    confirmPayment();
  }, [searchParams]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  if (status === 'success') {
    return (
      <div className={successStyles.pageContainer}>
        <div className={successStyles.headerSection}>
          <h1 className={successStyles.title}>수강 신청 완료!</h1>
          <p className={successStyles.subtitle}>
            교육 프로그램 등록이 완료되었습니다.<br />
            상세 내역은 내 강의 목록에서 확인하실 수 있습니다.
          </p>
        </div>

        {paymentInfo && (
          <div className={successStyles.cardSection}>
            <div className={successStyles.cardRow}>
              <p className={successStyles.cardLabel}>주문 번호</p>
              <p className={successStyles.cardValue}>#{paymentInfo.orderId}</p>
            </div>
            <div className={successStyles.cardRow}>
              <p className={successStyles.cardLabel}>강의명</p>
              <p className={successStyles.cardValue}>{paymentInfo.orderName || 'VenueOn 강의'}</p>
            </div>
            <div className={successStyles.cardRow}>
              <p className={successStyles.cardLabel}>결제 금액</p>
              <p className={successStyles.cardValue}>{formatPrice(paymentInfo.amount)}</p>
            </div>
          </div>
        )}

        <div className={successStyles.buttonGroup}>
          <Button
            variant="outlined"
            size="large"
            style={{ flex: 1, backgroundColor: '#FFFFFF', borderColor: 'var(--color-gray-200, #E5E7EB)' }}
            onClick={() => window.location.href = '/orders'}
          >
            내 강의 목록
          </Button>
          <Button
            variant="primary"
            size="large"
            style={{ flex: 1, backgroundColor: 'var(--color-gray-900, #111827)', color: 'white', border: 'none' }}
            onClick={() => window.location.href = '/'}
          >
            커뮤니티 입장
          </Button>
        </div>

        {/* 우측 하단 토스트 모달 (필요시 유지) */}
        <div className={successStyles.toastContainer}>
          <div className={successStyles.toastIcon}>🎉</div>
          <div className={successStyles.toastContent}>
            <h4 className={successStyles.toastTitle}>수강신청 완료!</h4>
            <p className={successStyles.toastMessage}>성공적으로 등록되었습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutCard}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {status === 'loading' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>{message}</p>
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
