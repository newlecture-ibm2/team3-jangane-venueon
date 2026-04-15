"use client";

import React, { Suspense } from 'react';
import styles from './page.module.css';
import CheckoutContent from './_components/CheckoutContent';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.checkoutContainer}><div className={styles.checkoutCard}><p style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</p></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
