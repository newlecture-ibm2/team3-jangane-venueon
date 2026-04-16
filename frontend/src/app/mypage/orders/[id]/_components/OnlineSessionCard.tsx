'use client';

import React from 'react';
import { Button, Toast } from '@/components/ui';
import styles from './OnlineSessionCard.module.css';
import { OnlineSessionInfo } from '../useOrderDetail';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  session: OnlineSessionInfo;
}

export function OnlineSessionCard({ session }: Props) {
  const { showToast } = useUIStore();

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(session.onlineLink).then(() => {
      showToast('링크 복사', 'success', '온라인 접속 링크가 클립보드에 복사되었습니다.');
    }).catch(() => {
      showToast('오류', 'error', '링크 복사에 실패했습니다.');
    });
  };

  const handleEnterSession = () => {
    window.open(session.onlineLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{session.title}</h3>
        {session.isLive && (
          <div className={styles.liveBadge}>
            <span className={styles.pulse}></span>
            LIVE
          </div>
        )}
      </div>
      <div>
        <p className={styles.time}>
          {formatDate(session.startTime)} ~ {formatDate(session.endTime)}
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="primary" onClick={handleEnterSession}>
          입장하기
        </Button>
        <Button variant="secondary" onClick={handleCopyLink}>
          링크 복사
        </Button>
      </div>
    </div>
  );
}
