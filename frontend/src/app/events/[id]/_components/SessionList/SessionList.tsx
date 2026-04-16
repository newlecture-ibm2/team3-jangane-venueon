import React from 'react';
import styles from './SessionList.module.css';
import { Tag } from '@/components/ui';
import { format } from 'date-fns';

const RECRUIT_VARIANTS: Record<number, { label: string; variant: 'gray' | 'purple' | 'green' | 'red' }> = {
  1: { label: '모집예정', variant: 'gray' },
  2: { label: '모집중', variant: 'purple' },
  3: { label: '모집마감', variant: 'red' },
  4: { label: '행사종료', variant: 'gray' },
  5: { label: '결제마감', variant: 'red' },
  6: { label: '모집취소', variant: 'gray' },
};

export interface SessionListProps {
  sessions: any[];
}

export default function SessionList({ sessions }: SessionListProps) {
  if (!sessions || sessions.length === 0) return null;

  return (
    <div className={styles.sessionList}>
      {sessions.map((session: any, index: number) => {
        const recruitVariant = RECRUIT_VARIANTS[session.recruitmentStatus?.id]?.variant || 'gray';
        return (
          <div key={session.id || index} className={styles.sessionCard}>
            <div className={styles.sessionHeader}>
              <h4 className={styles.sessionTitle}>{session.title || `세션 ${index + 1}`}</h4>
              <Tag variant={recruitVariant}>{session.recruitmentStatus?.label || '—'}</Tag>
            </div>
            {session.description && (
              <p className={styles.sessionDesc}>{session.description}</p>
            )}
            <div className={styles.sessionMeta} suppressHydrationWarning>
              <span suppressHydrationWarning>🕒 {session.startTime ? `${format(new Date(session.startTime), 'MM.dd HH:mm')} ~ ${session.endTime ? format(new Date(session.endTime), 'MM.dd HH:mm') : '미정'}` : '시간 미정'}</span>
              <span suppressHydrationWarning>📋 모집 {session.recruitStartDate ? format(new Date(session.recruitStartDate), 'MM.dd') : ''} ~ {session.recruitEndDate ? format(new Date(session.recruitEndDate), 'MM.dd') : ''}</span>
              <span>🏫 {session.isOnline ? '온라인' : (session.location || '장소 미정')}</span>
              <span>👤 {session.currentAttendees || 0} / {session.maxAttendees || '∞'} 명 (잔여 {session.remainingCapacity !== undefined ? session.remainingCapacity : '∞'}석)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
