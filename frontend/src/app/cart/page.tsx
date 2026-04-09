'use client';

import { useState } from 'react';
import styles from './cart.module.css';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Pagination from '@/components/ui/Pagination';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { useCart } from './hooks/use-cart';

export default function CartPage() {
  const {
    cartItems,
    loading,
    totalAmount,
    checkedItemsCount,
    updateQuantity,
    removeItem,
    toggleSelectAll,
    toggleSelectItem
  } = useCart();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = cartItems.slice(startIndex, endIndex);

  const finalAmount = totalAmount; // No discount applied

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
                    <div className={styles.courseNameCell}>이벤트 명</div>
                    <div className={styles.scheduleCell}>일정</div>
                    <div className={styles.priceCell}>가격</div>
                    <div className={styles.quantityCell}>수량</div>
                    <div className={styles.deleteCell}></div>
                  </div>
                </div>

                <div className={styles.body}>
                  {currentItems.map(item => (
                    <div key={item.id}>
                      {/* 부모 행 */}
                      <div className={styles.row}>
                        <div className={styles.checkboxCell}>
                          <Checkbox
                            checked={item.checked}
                            onChange={() => toggleSelectItem(item.id)}
                          />
                        </div>
                        <div className={styles.courseNameCell}>{item.title}</div>
                        <div className={styles.scheduleCell}>{item.schedule}</div>
                        <div className={styles.priceCell}>{item.price.toLocaleString()}원</div>
                        <div className={styles.quantityCell}>
                          {/* 부모 수량 조절 (필요 시 유지, 세션들의 수량을 대표할 수도 있음) */}
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

                      {/* 하위 세션 행들 */}
                      {item.sessions?.map(session => (
                        <div key={session.id} className={`${styles.row} ${styles.sessionRow}`}>
                          <div className={styles.checkboxCell}>
                            <Checkbox
                              checked={session.checked}
                              onChange={() => toggleSelectItem(session.id)}
                            />
                          </div>
                          <div className={`${styles.courseNameCell} ${styles.indent}`}>
                            <span>└ {session.title}</span>
                          </div>
                          <div className={styles.scheduleCell}>{session.schedule}</div>
                          <div className={styles.priceCell}>{session.price.toLocaleString()}원</div>
                          <div className={styles.quantityCell}>
                            <div className={styles.quantityControl}>
                              <button 
                                className={styles.quantityButton}
                                onClick={() => updateQuantity(session.id, -1)}
                              >
                                -
                              </button>
                              <span className={styles.quantityNumber}>{session.quantity}</span>
                              <button 
                                className={styles.quantityButton}
                                onClick={() => updateQuantity(session.id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className={styles.deleteCell}>
                            <button
                              className={styles.deleteIconButton}
                              onClick={() => removeItem(session.id)}
                            >
                              <DeleteIcon className={styles.deleteIcon} />
                            </button>
                          </div>
                        </div>
                      ))}
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
                <span className="value">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className={styles.summaryRow}>
                <span className="label">즉시할인 예상금액</span>
                <span className="value discount">0원</span>
              </div>
              <div className={styles.summaryRow}>
                <span className="label">쿠폰할인 예상금액</span>
                <span className="value discount">0원</span>
              </div>
              <div className={styles.summaryRow}>
                <span className="label">총 배송비</span>
                <span className="value">0원</span>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.total}>
              <span className="label">총 주문 예상 금액</span>
              <span className="value total">{finalAmount.toLocaleString()}원</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="large"
            className={styles.orderButton}
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
