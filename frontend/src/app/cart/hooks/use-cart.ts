import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  title: string;
  schedule: string;
  price: number;
  quantity: number;
  checked: boolean;
  sessions?: CartItem[];
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
      const formattedItems: CartItem[] = items.map((item) => {
        // 더미 데이터 생성: 각 이벤트마다 1~2개의 세션 추가
        const dummySessions: CartItem[] = [
          {
            id: `session-${item.cartId}-1`,
            title: `[세션] ${item.eventTitle} - 오전 타임`,
            schedule: '2026-05-10 10:00',
            price: Math.floor(item.price / 2),
            quantity: 1,
            checked: false,
          },
          {
            id: `session-${item.cartId}-2`,
            title: `[세션] ${item.eventTitle} - 오후 타임`,
            schedule: '2026-05-10 14:00',
            price: Math.floor(item.price / 2),
            quantity: 1,
            checked: false,
          }
        ];

        return {
          id: String(item.cartId),
          title: item.eventTitle,
          schedule: new Date(item.startDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short',
          }),
          price: item.price, 
          quantity: item.quantity,
          checked: false,
          sessions: dummySessions,
        };
      });
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
    setCartItems(items => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        if (item.sessions) {
          const updatedSessions = item.sessions.map(s => 
            s.id === id ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s
          );
          return { ...item, sessions: updatedSessions };
        }
        return item;
      });
    });
  };

  // 항목 삭제
  const removeItem = async (id: string) => {
    setCartItems(prevItems => {
      // 1. 부모 삭제인 경우
      const filteredParents = prevItems.filter(item => item.id !== id);
      if (filteredParents.length !== prevItems.length) return filteredParents;

      // 2. 자식 삭제인 경우
      return prevItems.map(item => {
        if (!item.sessions) return item;
        const filteredSessions = item.sessions.filter(s => s.id !== id);
        return { ...item, sessions: filteredSessions };
      }).filter(item => item.sessions && item.sessions.length > 0);
    });
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    const allChecked = cartItems.every(item => item.checked && item.sessions?.every(s => s.checked));
    const nextState = !allChecked;
    
    setCartItems(items => items.map(item => ({
      ...item,
      checked: nextState,
      sessions: item.sessions?.map(s => ({ ...s, checked: nextState }))
    })));
  };

  // 개별 선택 변경
  const toggleSelectItem = (id: string) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const nextChecked = !item.checked;
          return {
            ...item,
            checked: nextChecked,
            sessions: item.sessions?.map(s => ({ ...s, checked: nextChecked }))
          };
        }

        if (item.sessions) {
          let updatedChild = false;
          const nextSessions = item.sessions.map(s => {
            if (s.id === id) {
              updatedChild = true;
              return { ...s, checked: !s.checked };
            }
            return s;
          });

          if (updatedChild) {
            const allSessionsChecked = nextSessions.every(s => s.checked);
            return {
              ...item,
              checked: allSessionsChecked,
              sessions: nextSessions
            };
          }
        }
        return item;
      });
    });
  };

  // 부모 가격 계산 및 체크된 항목 집계
  const processedCartItems = cartItems.map(item => {
    const sessionsTotal = item.sessions?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0;
    return {
      ...item,
      price: sessionsTotal > 0 ? sessionsTotal : item.price
    };
  });

  const totalAmount = processedCartItems
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price, 0);

  const checkedItemsCount = processedCartItems.filter(item => item.checked).length;

  return {
    cartItems: processedCartItems,
    loading,
    totalAmount,
    checkedItemsCount,
    updateQuantity,
    removeItem,
    toggleSelectAll,
    toggleSelectItem,
    refresh: fetchItems
  };
};
