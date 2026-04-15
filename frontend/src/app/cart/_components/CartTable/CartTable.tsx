import { useState } from 'react';
import styles from './CartTable.module.css';
import Checkbox from '@/components/ui/Checkbox';
import Pagination from '@/components/ui/Pagination';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { CartItem } from '../../useCart';

interface CartTableProps {
  cartItems: CartItem[];
  loading: boolean;
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
}

export default function CartTable({
  cartItems,
  loading,
  toggleSelectAll,
  toggleSelectItem,
  updateQuantity,
  removeItem,
}: CartTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = cartItems.slice(startIndex, endIndex);

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price) + '원';

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
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
  );
}
