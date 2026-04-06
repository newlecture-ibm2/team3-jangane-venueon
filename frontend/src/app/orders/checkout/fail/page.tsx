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
    <div className="container-single">
      <div className={styles.checkoutCard}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ marginBottom: '8px' }}>결제에 실패했습니다</h2>
          <p style={{ color: 'var(--color-text-gray-500)', marginBottom: '4px' }}>에러 코드: {code}</p>
          <p style={{ color: 'var(--color-text-gray-500)', marginBottom: '24px' }}>{message}</p>
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
