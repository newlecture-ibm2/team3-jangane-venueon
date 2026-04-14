"use client";

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './checkout.module.css';
import { Button } from '@/components/ui';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

/**
 * 백엔드 POST /orders 통합 응답 타입
 * v6: 단건/다건 통합 → orderIds[], totalAmount
 */
interface CreateOrderData {
  orderIds: number[];
  tossOrderId: string;
  totalAmount: number;
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
  const orderCreated = useRef(false); // 중복 주문 생성 방지 플래그

  // 1단계: 백엔드에 통합 주문 생성 요청 (한 번만 실행)
  useEffect(() => {
    if (orderCreated.current) return;
    orderCreated.current = true;

    const createOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        // v6: 장바구니/이벤트 상세 모두 items[] 형태로 통합
        const itemsParam = searchParams.get('items');
        const ticketId = searchParams.get('ticketId');
        const quantity = searchParams.get('quantity') || '1';

        let items: { ticketId: number; quantity: number }[];

        if (itemsParam) {
          // 장바구니에서 진입: URL 파라미터에 items JSON
          items = JSON.parse(itemsParam);
        } else if (ticketId) {
          // 이벤트 상세에서 단건 진입: ticketId + quantity
          items = [{ ticketId: Number(ticketId), quantity: Number(quantity) }];
        } else {
          throw new Error('주문 정보가 올바르지 않습니다.');
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            paymentMethod: 'CARD',
          }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('주문은 로그인 후에 사용할 수 있습니다.');
          }
          const errorBody = await res.json().catch(() => null);
          throw new Error(errorBody?.message || `주문 생성 실패 (${res.status})`);
        }

        const json = await res.json();
        const data = json.data;

        setOrderData({
          orderIds: data.orderIds || [data.orderId],
          tossOrderId: data.tossOrderId,
          totalAmount: data.totalAmount ?? data.amount ?? 0,
          orderName: data.orderName,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          tossClientKey: data.tossClientKey,
        });

        // 무료 결제(0원)인 경우 위젯을 띄우지 않고 성공 페이지로 즉시 이동
        if ((data.totalAmount ?? data.amount ?? 0) === 0) {
          window.location.replace(`/orders/checkout/success?paymentKey=dummy_key&orderId=${data.tossOrderId}&amount=0&backendOrderId=${data.orderIds ? data.orderIds[0] : data.orderId}`);
        }
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
        const customerKey = 'customer_' + orderData.orderIds[0];
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
      await widgets.setAmount({ currency: 'KRW', value: orderData.totalAmount });

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
        successUrl: `${window.location.origin}/orders/checkout/success?backendOrderId=${orderData.orderIds[0]}`,
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Order Items - 백엔드 데이터 기반 */}
        <section className={styles.section}>
          <div className={styles.orderItem}>
            <span className={styles.itemTitle}>{orderData.orderName}</span>
            <span className={styles.itemPrice}>{formatPrice(orderData.totalAmount)}</span>
          </div>
        </section>

        {/* Price Summary */}
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

        {/* Total Amount */}
        <section className={styles.totalSection}>
          <span className={styles.totalLabel}>총 주문 예상 금액</span>
          <span className={styles.totalAmount}>₩{new Intl.NumberFormat('ko-KR').format(orderData.totalAmount)}</span>
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
          {formatPrice(orderData.totalAmount)} 결제하기
        </Button>

        {/* Dummy Submit */}
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
