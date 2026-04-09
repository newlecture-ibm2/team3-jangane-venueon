import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string; // 부모에서는 eventId (string), 자식에서는 cartId (string) 역할
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
  sessionId: number;
  sessionTitle: string;
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
      
      // eventId 기준으로 그룹화하여 부모-자식 구조 생성
      const eventGroups = items.reduce((acc, item) => {
        if (!acc[item.eventId]) {
          acc[item.eventId] = {
            id: String(item.eventId), // 부모 ID는 eventId 사용
            title: item.eventTitle,
            schedule: '일정 확인 필요', // 필요시 API 추가 데이터 활용
            price: 0, // 하위 세션 합계로 대체될 것임
            quantity: 1,
            checked: false,
            sessions: []
          };
        }
        
        const group = acc[item.eventId];
        if (!group.sessions) {
          group.sessions = [];
        }
        
        group.sessions.push({
          id: String(item.cartId), // 자식(세션) ID는 cartId 사용 (삭제를 위해)
          title: item.sessionTitle,
          schedule: new Date(item.startDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }),
          price: item.price,
          quantity: item.quantity,
          checked: false
        });
        
        return acc;
      }, {} as Record<number, CartItem>);

      // 부모의 schedule을 첫 번째 세션의 일정으로 임시 표시
      const formattedItems = Object.values(eventGroups).map(group => {
        if (group.sessions && group.sessions.length > 0) {
           group.schedule = group.sessions[0].schedule;
        }
        return group;
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

  // 수량 변경 (백엔드 API 연동 추가)
  const updateQuantity = async (id: string, delta: number) => {
    let targetCartId: string | undefined;
    let newQuantity = 0;

    // 변경될 수량 계산 및 대상 cartId 식별
    cartItems.forEach(item => {
        if (item.sessions) {
            const session = item.sessions.find(s => s.id === id);
            if (session) {
                targetCartId = session.id;
                newQuantity = Math.max(1, session.quantity + delta);
            }
        }
    });

    if (!targetCartId) return; // 부모 수량 조절 버튼 클릭 시 작동 안함 (혹은 개별 구현)

    try {
      const res = await fetch(`/api/cart/${targetCartId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('수량 변경 실패');

      // 상태 업데이트
      setCartItems(items => items.map(item => {
        if (item.sessions) {
          const updatedSessions = item.sessions.map(s => 
            s.id === targetCartId ? { ...s, quantity: newQuantity } : s
          );
          return { ...item, sessions: updatedSessions };
        }
        return item;
      }));
    } catch (error) {
      console.error('수량 변경 실패:', error);
    }
  };

  // 항목 삭제 (계층적 삭제 반영)
  const removeItem = async (id: string) => {
    try {
      // 1. 부모 삭제인 경우 (id가 eventId와 동일한 부모)
      const isParent = cartItems.some(i => i.id === id);
      if (isParent) {
         const parent = cartItems.find(i => i.id === id);
         if (parent?.sessions) {
            // 모든 자식 cartId 삭제 API 호출 (Promise.all)
            await Promise.all(
                parent.sessions.map(session => 
                    fetch(`/api/cart/${session.id}`, { method: 'DELETE' })
                )
            );
         }
         setCartItems(prevItems => prevItems.filter(item => item.id !== id));
         return;
      }

      // 2. 자식 삭제인 경우 (id가 cartId)
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('자식 항목 삭제 실패');

      setCartItems(prevItems => {
        return prevItems.map(item => {
          if (!item.sessions) return item;
          const filteredSessions = item.sessions.filter(s => s.id !== id);
          return { ...item, sessions: filteredSessions };
        }).filter(item => item.sessions && item.sessions.length > 0);
      });

    } catch (error) {
      console.error('항목 삭제 실패:', error);
    }
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
