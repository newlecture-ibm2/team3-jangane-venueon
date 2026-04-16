"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { Button } from '@/components/ui';
import { usePaymentConfirm } from './usePaymentConfirm';


function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { status, message, paymentInfo } = usePaymentConfirm(
    searchParams.get('paymentKey'),
    searchParams.get('orderId'),
    searchParams.get('amount'),
    searchParams.get('backendOrderId')
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  if (status === 'success') {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>수강 신청 완료!</h1>
          <p className={styles.subtitle}>
            교육 프로그램 등록이 완료되었습니다.<br />
            상세 내역은 내 세션 목록에서 확인하실 수 있습니다.
          </p>
        </div>

        {paymentInfo && (
          <div className={styles.cardSection}>
            <div className={styles.cardRow}>
              <p className={styles.cardLabel}>주문 번호</p>
              <p className={styles.cardValue}>#{paymentInfo.orderId}</p>
            </div>
            <div className={styles.cardRow}>
              <p className={styles.cardLabel}>세션명</p>
              <p className={styles.cardValue}>{paymentInfo.orderName || 'VenueOn 세션'}</p>
            </div>
            <div className={styles.cardRow}>
              <p className={styles.cardLabel}>결제 금액</p>
              <p className={styles.cardValue}>{formatPrice(paymentInfo.amount)}</p>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button
            variant="outlined"
            size="large"
            style={{ flex: 1, backgroundColor: '#FFFFFF', borderColor: 'var(--color-gray-200, #E5E7EB)' }}
            onClick={() => window.location.href = '/mypage/events'}
          >
            내 이벤트 목록
          </Button>
          <Button
            variant="primary"
            size="large"
            style={{ flex: 1, backgroundColor: 'var(--color-gray-900, #111827)', color: 'white', border: 'none' }}
            onClick={() => window.location.href = '/community?tab=joined'}
          >
            커뮤니티 탐색
          </Button>
        </div>

        {/* 우측 하단 토스트 모달 (필요시 유지) */}
        <div className={styles.toastContainer}>
          <div className={styles.toastIcon}>🎉</div>
          <div className={styles.toastContent}>
            <h4 className={styles.toastTitle}>수강신청 완료!</h4>
            <p className={styles.toastMessage}>성공적으로 등록되었습니다.</p>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.checkoutContainer}><div className={styles.checkoutCard}><p style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</p></div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
