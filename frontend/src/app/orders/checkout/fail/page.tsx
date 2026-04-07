"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../checkout.module.css';
import { Button } from '@/components/ui';

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '알 수 없는 오류';
  const message = searchParams.get('message') || '결제 처리 중 문제가 발생했습니다.';

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutCard}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ marginBottom: '16px', color: 'var(--color-error)' }}>결제 실패</h2>
          <p style={{ marginBottom: '24px' }}>
            에러 코드: {code}<br />
            {message && <span>메시지: {message}</span>}
          </p>
          <Button
            variant="primary"
            size="large"
            onClick={() => window.history.back()}
          >
            다시 시도하기
          </Button>
        </div>
      </div>
    </div>
  );
}
