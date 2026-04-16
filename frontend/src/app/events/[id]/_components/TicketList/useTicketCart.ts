import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useTicketCart(eventId: number) {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();

  const proceedAddToCart = async () => {
    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicketId, quantity: 1 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || '장바구니 추가 실패');
      }
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.message || '장바구니 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToCartClick = async () => {
    setAddingToCart(true);
    try {
      const cartRes = await fetch('/api/cart');
      if (!cartRes.ok) throw new Error('장바구니 목록을 불러오지 못했습니다.');

      const cartItems = await cartRes.json();

      const hasSameTicket = cartItems.some((item: any) => item.ticketId === selectedTicketId);
      if (hasSameTicket) {
        setShowErrorModal(true);
        return;
      }

      const hasSameEventTicket = cartItems.some((item: any) => item.eventId === eventId);
      if (hasSameEventTicket) {
        setShowConfirmModal(true);
        return; // wait for modal
      }

      await proceedAddToCart();
    } catch (err: any) {
      alert(err.message || '장바구니 확인 중 오류가 발생했습니다.');
      setAddingToCart(false);
    }
  };

  return {
    selectedTicketId,
    setSelectedTicketId,
    addingToCart,
    setAddingToCart,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal,
    showErrorModal,
    setShowErrorModal,
    proceedAddToCart,
    handleAddToCartClick,
    router
  };
}
