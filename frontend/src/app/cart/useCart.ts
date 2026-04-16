import { useState, useEffect, useCallback } from 'react';

/**
 * 장바구니 항목 (프론트엔드 표시용)
 * v6: 티켓 기반 — 계층 구조(이벤트 > 세션) 제거, 티켓 단위 플랫 리스트
 */
export interface CartItem {
  id: string;       // cartId (string)
  eventId: number;
  eventTitle: string;
  ticketId: number;
  ticketName: string;
  ticketPrice: number;
  ticketOriginalPrice: number;
  discountRate: number;
  quantity: number;
  subtotal: number;
  checked: boolean;
  createdAt: string;
}

/**
 * 백엔드 API 응답 타입
 * v6: CartResponse(ticketId, ticketName, ticketPrice, ticketOriginalPrice, discountRate)
 */
export interface ApiCartItem {
  cartId: number;
  eventId: number;
  eventTitle: string;
  ticketId: number;
  ticketName: string;
  ticketPrice: number;
  ticketOriginalPrice: number;
  discountRate: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 장바구니 데이터 로드
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      if (!res.ok) throw new Error('장바구니 로드 실패');
      
      const items: ApiCartItem[] = await res.json();
      
      // v6: 티켓 기반 플랫 리스트 — 그룹핑 없이 바로 CartItem으로 변환
      const formattedItems: CartItem[] = items.map(item => ({
        id: String(item.cartId),
        eventId: item.eventId,
        eventTitle: item.eventTitle,
        ticketId: item.ticketId,
        ticketName: item.ticketName,
        ticketPrice: item.ticketPrice,
        ticketOriginalPrice: item.ticketOriginalPrice,
        discountRate: item.discountRate,
        quantity: item.quantity,
        subtotal: item.subtotal,
        checked: false,
        createdAt: item.createdAt,
      }));

      setCartItems(formattedItems);
    } catch (error) {
      console.error('장바구니 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // 수량 변경
  const updateQuantity = async (id: string, delta: number) => {
    const target = cartItems.find(item => item.id === id);
    if (!target) return;

    const newQuantity = Math.max(1, target.quantity + delta);

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('수량 변경 실패');

      setCartItems(items => items.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, subtotal: item.ticketPrice * newQuantity }
          : item
      ));
    } catch (error) {
      console.error('수량 변경 실패:', error);
    }
  };

  // 항목 삭제
  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('항목 삭제 실패');

      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('항목 삭제 실패:', error);
    }
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    const allChecked = cartItems.every(item => item.checked);
    const nextState = !allChecked;

    setCartItems(items => items.map(item => ({
      ...item,
      checked: nextState,
    })));
  };

  // 개별 선택 변경
  const toggleSelectItem = (id: string) => {
    setCartItems(prevItems => prevItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // 가격 계산
  const totalAmount = cartItems
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.ticketPrice * item.quantity, 0);

  const checkedItemsCount = cartItems.filter(item => item.checked).length;

  /**
   * 체크된 항목들을 통합 주문 API에 맞는 items 배열로 변환
   * v6: cartIds 대신 [{ticketId, quantity}] 형태
   */
  const getCheckedOrderItems = (): { ticketId: number; quantity: number }[] => {
    return cartItems
      .filter(item => item.checked)
      .map(item => ({
        ticketId: item.ticketId,
        quantity: item.quantity,
      }));
  };

  return {
    cartItems,
    loading,
    totalAmount,
    checkedItemsCount,
    updateQuantity,
    removeItem,
    toggleSelectAll,
    toggleSelectItem,
    getCheckedOrderItems,
    refresh: fetchItems
  };
};
