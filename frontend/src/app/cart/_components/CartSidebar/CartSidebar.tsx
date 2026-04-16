import { useRouter } from 'next/navigation';
import styles from './CartSidebar.module.css';
import Button from '@/components/ui/Button';

interface CartSidebarProps {
  totalAmount: number;
  finalAmount: number;
  checkedItemsCount: number;
  getCheckedOrderItems: () => { ticketId: number; quantity: number }[];
}

export default function CartSidebar({
  totalAmount,
  finalAmount,
  checkedItemsCount,
  getCheckedOrderItems,
}: CartSidebarProps) {
  const router = useRouter();

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price) + '원';

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>주문 예상 금액</h2>

      <div className={styles.summary}>
        <div className={styles.summaryDetails}>
          <div className={styles.summaryRow}>
            <span className="label">총 선택상품금액</span>
            <span className="value">{formatPrice(totalAmount)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className="label">즉시할인 예상금액</span>
            <span className="value discount">0원</span>
          </div>
          <div className={styles.summaryRow}>
            <span className="label">쿠폰할인 예상금액</span>
            <span className="value discount">0원</span>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.total}>
          <span className="label">총 주문 예상 금액</span>
          <span className="value total">{formatPrice(finalAmount)}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="large"
        className={styles.orderButton}
        onClick={() => {
          const orderItems = getCheckedOrderItems();
          if (orderItems.length === 0) {
            alert('주문할 항목을 선택해주세요.');
            return;
          }
          const params = new URLSearchParams();
          params.set('items', JSON.stringify(orderItems));
          router.push(`/orders/checkout?${params.toString()}`);
        }}
      >
        <span>주문하기</span>
        {checkedItemsCount > 0 && (
          <span className={styles.itemCount}>{checkedItemsCount}</span>
        )}
      </Button>
    </div>
  );
}
