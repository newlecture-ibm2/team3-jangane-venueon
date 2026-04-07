"use client";

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './checkout.module.css';
import { Button } from '@/components/ui';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

// 백엔드 POST /orders 응답 타입
interface CreateOrderData {
  orderId: number;
  tossOrderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  tossClientKey: string;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.checkoutContainer}><div className={styles.checkoutCard}><p style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</p></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [widgets, setWidgets] = useState<any>(null);
  const [orderData, setOrderData] = useState<CreateOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1단계: 백엔드에 주문 생성 요청
  useEffect(() => {
    const createOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const eventId = searchParams.get('eventId') || '1';
        const quantity = searchParams.get('quantity') || '1';

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: Number(eventId),
            quantity: Number(quantity),
            paymentMethod: 'CARD',
          }),
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          throw new Error(errorBody?.message || `주문 생성 실패 (${res.status})`);
        }

        const json = await res.json();
        setOrderData(json.data);
      } catch (err: any) {
        console.error('주문 생성 에러:', err);
        setError(err.message || '주문을 생성하는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [searchParams]);

  // 2단계: 주문 데이터가 준비되면 토스 위젯 초기화
  useEffect(() => {
    if (!orderData) return;

    (async () => {
      try {
        const customerKey = 'customer_' + orderData.orderId;
        const tossPayments = await loadTossPayments(orderData.tossClientKey);
        const generatedWidgets = tossPayments.widgets({ customerKey });
        setWidgets(generatedWidgets);
      } catch (err) {
        console.error('토스 위젯 초기화 실패:', err);
        setError('결제 위젯을 불러오는 중 오류가 발생했습니다.');
      }
    })();
  }, [orderData]);

  // 3단계: 위젯이 준비되면 결제 수단 & 동의 영역 렌더링
  useEffect(() => {
    if (!widgets || !orderData) return;

    (async () => {
      await widgets.setAmount({ currency: 'KRW', value: orderData.amount });

      await Promise.all([
        widgets.renderPaymentMethods({
          selector: '#payment-widget',
          variantKey: 'DEFAULT',
        }),
        widgets.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        }),
      ]);
    })();
  }, [widgets, orderData]);

  // 4단계: 결제 요청 (토스 결제창 열기)
  const handlePaymentRequest = useCallback(async () => {
    if (!widgets || !orderData) return;

    try {
      await widgets.requestPayment({
        orderId: orderData.tossOrderId,
        orderName: orderData.orderName,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        successUrl: `${window.location.origin}/orders/checkout/success`,
        failUrl: `${window.location.origin}/orders/checkout/fail`,
      });
    } catch (err) {
      console.error('결제 요청 에러:', err);
    }
  }, [widgets, orderData]);

  // 금액 포맷 헬퍼
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  // --- 로딩/에러 상태 ---
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
        {/* Header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>결제</h1>
          <button className={styles.closeBtn} aria-label="닫기" onClick={() => window.history.back()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Order Items - 백엔드 데이터 기반 */}
        <section className={styles.section}>
          <div className={styles.orderItem}>
            <span className={styles.itemTitle}>{orderData.orderName}</span>
            <span className={styles.itemPrice}>{formatPrice(orderData.amount)}</span>
          </div>
        </section>

        {/* Price Summary */}
        <section className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span>총 선택상품금액</span>
            <span>{formatPrice(orderData.amount)}</span>
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

        {/* Total Amount */}
        <section className={styles.totalSection}>
          <span className={styles.totalLabel}>총 주문 예상 금액</span>
          <span className={styles.totalAmount}>₩{new Intl.NumberFormat('ko-KR').format(orderData.amount)}</span>
        </section>

        {/* Toss Payment Widget Area */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>결제수단</h2>
          <div id="payment-widget" />
        </section>

        {/* Agreement */}
        <section className={styles.agreementSection}>
          <div id="agreement" />
        </section>

        {/* Submit */}
        <Button
          className={styles.submitBtn}
          onClick={handlePaymentRequest}
          type="button"
          size="large"
          variant="primary"
        >
          {formatPrice(orderData.amount)} 결제하기
        </Button>

        {/* Dummy Submit */}
        <Button
          className={styles.submitBtn}
          onClick={() => {
            if (!orderData) return;
            window.location.href = `/orders/checkout/success?paymentKey=dummy_key&orderId=${orderData.tossOrderId}&amount=${orderData.amount}`;
          }}
          type="button"
          size="large"
          style={{ marginTop: '12px', background: 'var(--color-text-gray-300)', color: 'var(--color-text-gray-900)' }}
        >
          {formatPrice(orderData.amount)} 더미결제하기 (테스트용)
        </Button>
      </div>
    </div>
  );
}
