import { useEffect, useState, useCallback, useRef } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

export interface CreateOrderData {
  orderIds: number[];
  tossOrderId: string;
  totalAmount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  tossClientKey: string;
}

export function useCheckout(itemsParam: string | null, ticketId: string | null, quantity: string | null) {
  const [widgets, setWidgets] = useState<any>(null);
  const [orderData, setOrderData] = useState<CreateOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderCreated = useRef(false);

  useEffect(() => {
    if (orderCreated.current) return;
    orderCreated.current = true;

    const createOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        let items: { ticketId: number; quantity: number }[];

        if (itemsParam) {
          items = JSON.parse(itemsParam);
        } else if (ticketId) {
          items = [{ ticketId: Number(ticketId), quantity: Number(quantity || '1') }];
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

        const newOrderData = {
          orderIds: data.orderIds || [data.orderId],
          tossOrderId: data.tossOrderId,
          totalAmount: data.totalAmount ?? data.amount ?? 0,
          orderName: data.orderName,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          tossClientKey: data.tossClientKey,
        };

        setOrderData(newOrderData);

        if (newOrderData.totalAmount === 0) {
          window.location.replace(`/orders/checkout/success?paymentKey=dummy_key&orderId=${newOrderData.tossOrderId}&amount=0&backendOrderId=${newOrderData.orderIds[0]}`);
        }
      } catch (err: any) {
        console.error('주문 생성 에러:', err);
        setError(err.message || '주문을 생성하는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [itemsParam, ticketId, quantity]);

  useEffect(() => {
    if (!orderData || orderData.totalAmount === 0) return;

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

  return { orderData, loading, error, handlePaymentRequest };
}
