'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './cart.module.css';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Pagination from '@/components/ui/Pagination';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { useCart } from './hooks/use-cart';

/**
 * 장바구니 페이지
 * v6: 이벤트-세션 계층 구조 제거 → 티켓 단위 플랫 리스트
 */
export default function CartPage() {
  const {
    cartItems,
    loading,
    totalAmount,
    checkedItemsCount,
    updateQuantity,
    removeItem,
    toggleSelectAll,
    toggleSelectItem,
    getCheckedOrderItems
  } = useCart();

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = cartItems.slice(startIndex, endIndex);

  const finalAmount = totalAmount;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.main}>
          <h1 className={styles.title}>장바구니</h1>

          <div className={styles.table}>
            {loading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : cartItems.length === 0 ? (
              <div className={styles.empty}>장바구니가 비어있습니다.</div>
            ) : (
              <>
                <div className={styles.header}>
                  <div className={styles.row}>
                    <div className={styles.checkboxCell}>
                      <Checkbox
                        checked={cartItems.length > 0 && cartItems.every(item => item.checked)}
                        onChange={toggleSelectAll}
                      />
                    </div>
                    <div className={styles.courseNameCell}>이벤트 / 티켓</div>
                    <div className={styles.priceCell}>가격</div>
                    <div className={styles.quantityCell}>수량</div>
                    <div className={styles.deleteCell}></div>
                  </div>
                </div>

                <div className={styles.body}>
                  {currentItems.map(item => (
                    <div key={item.id} className={styles.row}>
                      <div className={styles.checkboxCell}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                      </div>
                      <div className={styles.courseNameCell}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.eventTitle}</div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-gray-500)' }}>
                            🎟️ {item.ticketName}
                            {item.discountRate > 0 && (
                              <span style={{ marginLeft: '8px', color: 'var(--color-error)', fontWeight: 600 }}>
                                {item.discountRate}% 할인
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.priceCell}>
                        {item.discountRate > 0 && item.ticketOriginalPrice > 0 && (
                          <div style={{ textDecoration: 'line-through', color: 'var(--color-text-gray-400)', fontSize: '12px' }}>
                            {formatPrice(item.ticketOriginalPrice)}
                          </div>
                        )}
                        <div>{item.ticketPrice === 0 ? '무료' : formatPrice(item.ticketPrice)}</div>
                      </div>
                      <div className={styles.quantityCell}>
                        <div className={styles.quantityControl}>
                          <button 
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            -
                          </button>
                          <span className={styles.quantityNumber}>{item.quantity}</span>
                          <button 
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className={styles.deleteCell}>
                        <button
                          className={styles.deleteIconButton}
                          onClick={() => removeItem(item.id)}
                        >
                          <DeleteIcon className={styles.deleteIcon} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

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
              // v6: items를 URL 파라미터로 전달 (JSON 인코딩)
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
      </div>
    </div>
  );
}
