'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useCart } from './useCart';
import CartTable from './_components/CartTable/CartTable';
import CartSidebar from './_components/CartSidebar/CartSidebar';

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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.main}>
          <h1 className={styles.title}>장바구니</h1>

          <CartTable
            cartItems={cartItems}
            loading={loading}
            toggleSelectAll={toggleSelectAll}
            toggleSelectItem={toggleSelectItem}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
          />
        </div>

        <CartSidebar
          totalAmount={totalAmount}
          finalAmount={totalAmount}
          checkedItemsCount={checkedItemsCount}
          getCheckedOrderItems={getCheckedOrderItems}
        />
      </div>
    </div>
  );
}
