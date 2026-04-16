"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './CheckoutContent.module.css';
import { Button } from '@/components/ui';
import { useCheckout } from '../useCheckout';

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const { orderData, loading, error, handlePaymentRequest } = useCheckout(
    searchParams.get('items'),
    searchParams.get('ticketId'),
    searchParams.get('quantity')
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  if (loading) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutCard}>
          <p style={{ textAlign: 'center', padding: '40px 0' }}>주문 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutCard}>
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-error)' }}>
            {error || '주문 정보를 불러올 수 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutCard}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>결제</h1>
          <button className={styles.closeBtn} aria-label="닫기" onClick={() => window.history.back()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <section className={styles.section}>
          <div className={styles.orderItem}>
            <span className={styles.itemTitle}>{orderData.orderName}</span>
            <span className={styles.itemPrice}>{formatPrice(orderData.totalAmount)}</span>
          </div>
        </section>

        <section className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span>총 선택상품금액</span>
            <span>{formatPrice(orderData.totalAmount)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>즉시할인예상금액</span>
            <span className={styles.highlight}>0원</span>
          </div>
          <div className={styles.summaryRow}>
            <span>쿠폰할인예상금액</span>
            <span className={styles.highlight}>0원</span>
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.totalSection}>
          <span className={styles.totalLabel}>총 주문 예상 금액</span>
          <span className={styles.totalAmount}>₩{new Intl.NumberFormat('ko-KR').format(orderData.totalAmount)}</span>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>결제수단</h2>
          <div id="payment-widget" />
        </section>

        <section className={styles.agreementSection}>
          <div id="agreement" />
        </section>

        <Button
          className={styles.submitBtn}
          onClick={handlePaymentRequest}
          type="button"
          size="large"
          variant="primary"
        >
          {formatPrice(orderData.totalAmount)} 결제하기
        </Button>

        <Button
          className={styles.submitBtn}
          onClick={() => {
            if (!orderData) return;
            window.location.href = `/orders/checkout/success?paymentKey=dummy_key&orderId=${orderData.tossOrderId}&amount=${orderData.totalAmount}&backendOrderId=${orderData.orderIds[0]}`;
          }}
          type="button"
          size="large"
          style={{ marginTop: '12px', background: 'var(--color-text-gray-300)', color: 'var(--color-text-gray-900)' }}
        >
          {formatPrice(orderData.totalAmount)} 더미결제하기 (테스트용)
        </Button>
      </div>
    </div>
  );
}
