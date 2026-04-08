import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  title: string;
  schedule: string;
  price: number;
  quantity: number;
  checked: boolean;
}

export interface ApiCartItem {
  cartId: number;
  eventId: number;
  eventTitle: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  subtotal: number;
  startDate: string;
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
      const formattedItems: CartItem[] = items.map((item) => ({
        id: String(item.cartId),
        title: item.eventTitle,
        schedule: new Date(item.startDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        price: item.price,
        quantity: item.quantity,
        checked: false,
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
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);
    if (newQuantity === item.quantity) return;

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('수량 변경 실패');

      setCartItems(items =>
        items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
      );
    } catch (error) {
      console.error('수량 변경 실패:', error);
    }
  };

  // 항목 삭제
  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('항목 삭제 실패');
      
      setCartItems(items => items.filter(i => i.id !== id));
    } catch (error) {
      console.error('항목 삭제 실패:', error);
    }
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    const allChecked = cartItems.every(item => item.checked);
    setCartItems(items => items.map(item => ({ ...item, checked: !allChecked })));
  };

  // 개별 선택 변경
  const toggleSelectItem = (id: string) => {
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // 체크된 항목 계산
  const checkedItems = cartItems.filter(item => item.checked);
  const totalAmount = checkedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cartItems,
    loading,
    totalAmount,
    checkedItemsCount: checkedItems.length,
    updateQuantity,
    removeItem,
    toggleSelectAll,
    toggleSelectItem,
    refresh: fetchItems
  };
};
