"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { Button } from '@/components/ui';

function CheckoutFailContent() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get('code') || 'UNKNOWN_ERROR';
  const rawMessage = searchParams.get('message') || '결제 처리 중 문제가 발생했습니다.';

  // 토스 에러 코드 친화적 매핑 (대표적인 에러 위주로 처리)
  let userFriendlyMessage = rawMessage;
  if (rawCode === 'PAY_PROCESS_CANCELED') {
    userFriendlyMessage = '결제를 진행 중에 취소하셨습니다.';
  } else if (rawCode === 'PAY_PROCESS_ABORTED') {
    userFriendlyMessage = '승인 과정에서 결제가 중단되었습니다.';
  } else if (rawCode === 'REJECT_CARD_COMPANY') {
    userFriendlyMessage = '카드사에 의해 결제가 거절되었습니다. 잔액이나 한도를 확인해주세요.';
  } else if (rawCode === 'INVALID_CARD_COMPANY') {
    userFriendlyMessage = '유효하지 않은 카드이거나, 카드 정보가 잘못 입력되었습니다.';
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>결제에 실패했습니다</h1>
        <p className={styles.subtitle}>
          {userFriendlyMessage}<br />
          아래 버튼을 눌러 다시 시도해주시거나 다른 결제 수단을 선택해주세요.
        </p>
      </div>

      <div className={styles.buttonGroup}>
        <Button
          variant="outlined"
          size="large"
          style={{ flex: 1, backgroundColor: '#FFFFFF', borderColor: 'var(--color-gray-200, #E5E7EB)' }}
          onClick={() => window.location.href = '/orders'}
        >
          내 주문 내역
        </Button>
        <Button
          variant="primary"
          size="large"
          style={{ flex: 1, backgroundColor: 'var(--color-gray-900, #111827)', color: 'white', border: 'none' }}
          onClick={() => window.history.back()}
        >
          결제 다시 시도
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className={styles.checkoutContainer}><div className={styles.checkoutCard}><p>로딩 중...</p></div></div>}>
      <CheckoutFailContent />
    </Suspense>
  );
}
