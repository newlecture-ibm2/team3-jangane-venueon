'use client';

import React, { useState } from 'react';
import styles from './HostManagementPanel.module.css';

interface Session {
  id: number;
  title: string;
  recruitmentStatus: string;
  sessionStatus: string;
  isRecruitmentClosed: boolean;
  forcedRecruitmentStatus?: string | null;
  forcedSessionStatus?: string | null;
}

interface HostManagementPanelProps {
  eventId: number;
  creatorId?: number;
  status: string;
  sessions: Session[];
}

const EVENT_STATUSES = [
  { key: 'PUBLISHED', label: '게시됨', color: '#3b82f6' },
  { key: 'ONGOING', label: '진행 중', color: '#10b981' },
  { key: 'ENDED', label: '종료', color: '#6b7280' },
  { key: 'CANCELLED', label: '취소', color: '#ef4444' },
  { key: 'AUTO', label: '자동 (일정 기준)', color: '#8b5cf6' },
];

const RECRUIT_STATUSES = [
  { key: 'PENDING', label: '모집 대기', color: '#f59e0b' },
  { key: 'OPEN', label: '모집 중', color: '#10b981' },
  { key: 'CLOSED', label: '모집 마감', color: '#ef4444' },
  { key: 'AUTO', label: '자동 (날짜/정원 기반)', color: '#8b5cf6' },
];

export default function HostManagementPanel({ eventId, status, sessions: initialSessions }: HostManagementPanelProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [sessionStates, setSessionStates] = useState(
    initialSessions.map(s => ({
      ...s,
      recruitmentStatus: s.recruitmentStatus || 'OPEN',
      sessionStatus: s.sessionStatus || 'PUBLISHED',
      isRecruitmentClosed: s.isRecruitmentClosed,
      forcedRecruitmentStatus: s.forcedRecruitmentStatus || null,
      forcedSessionStatus: s.forcedSessionStatus || null,
    }))
  );

  // ── (이벤트 상태 변경 제거됨 - 세션 자동계산에 의존) ──

  // ── 세션 진행 상태 변경 ──
  const changeSessionStatus = async (sessionId: number, newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/host/events/${eventId}/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const updated = data?.data;
        setSessionStates(prev =>
          prev.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  sessionStatus: updated?.sessionStatus ?? (newStatus === 'AUTO' ? s.sessionStatus : newStatus),
                  forcedSessionStatus: updated?.forcedSessionStatus ?? (newStatus === 'AUTO' ? null : newStatus),
                }
              : s
          )
        );
      } else {
        alert('진행 상태 변경 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류 발생');
    } finally {
      setLoading(false);
    }
  };

  // ── 세션 모집 상태 변경 ──
  const changeRecruitmentStatus = async (sessionId: number, newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/host/events/${eventId}/sessions/${sessionId}/recruitment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const updated = data?.data;
        setSessionStates(prev =>
          prev.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  isRecruitmentClosed: updated?.isRecruitmentClosed ?? (newStatus === 'CLOSED'),
                  recruitmentStatus: updated?.recruitmentStatus ?? newStatus,
                  forcedRecruitmentStatus: updated?.forcedRecruitmentStatus ?? (newStatus === 'AUTO' ? null : newStatus),
                }
              : s
          )
        );
      } else {
        alert('모집 상태 변경 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>⚙️ 이벤트 및 세션 상태 관리 (호스트 전용)</h3>

      {/* ── 세션별 상태 관리 ── */}
      <div className={styles.section}>
        <div className={styles.sessionList}>
          {sessionStates.map((session, idx) => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionHeader}>
                <span className={styles.sessionName}>세션 {idx + 1}: {session.title}</span>
              </div>

              {/* 진행 상태 표시 (수동 변경 가능) */}
              <div className={styles.sessionStatusRow}>
                <span className={styles.rowLabel}>진행 상태</span>
                <div className={styles.statusGroup} style={{ gap: '6px' }}>
                  {EVENT_STATUSES.map(s => {
                    let isActive = false;
                    if (s.key === 'AUTO') isActive = (session.forcedSessionStatus == null);
                    else isActive = (session.forcedSessionStatus === s.key);

                    return (
                      <button
                        key={s.key}
                        className={`${styles.recruitBtn} ${isActive ? styles.recruitBtnActive : ''}`}
                        style={
                          isActive
                            ? { backgroundColor: s.color, borderColor: s.color, color: '#fff' }
                            : { borderColor: '#d1d5db', color: '#6b7280' }
                        }
                        onClick={() => changeSessionStatus(session.id, s.key)}
                        disabled={loading || isActive}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                  
                  {/* 자동 모드일 때만 배지로 현재 실제 상태를 보여줌 */}
                  {!session.forcedSessionStatus && (
                    <span className={styles.autoHint} style={{ marginLeft: '4px' }}>
                      (현재: {EVENT_STATUSES.find(r => r.key === session.sessionStatus)?.label || session.sessionStatus})
                    </span>
                  )}
                </div>
              </div>

              {/* 모집 상태 (클릭하여 변경 가능) */}
              <div className={styles.sessionStatusRow}>
                <span className={styles.rowLabel}>모집 상태</span>
                <div className={styles.statusGroup} style={{ gap: '6px' }}>
                  {RECRUIT_STATUSES.map(rs => {
                    // isActive 판단
                    let isActive = false;
                    if (rs.key === 'AUTO') isActive = (session.forcedRecruitmentStatus == null);
                    else isActive = (session.forcedRecruitmentStatus === rs.key);

                    return (
                      <button
                        key={rs.key}
                        className={`${styles.recruitBtn} ${isActive ? styles.recruitBtnActive : ''}`}
                        style={
                          isActive
                            ? { backgroundColor: rs.color, borderColor: rs.color, color: '#fff' }
                            : { borderColor: '#d1d5db', color: '#6b7280' }
                        }
                        onClick={() => changeRecruitmentStatus(session.id, rs.key)}
                        disabled={loading || isActive}
                      >
                        {rs.label}
                      </button>
                    );
                  })}
                  
                  {/* 자동 모드일 때만 배지로 현재 실제 상태를 보여줌 */}
                  {!session.forcedRecruitmentStatus && (
                    <span className={styles.autoHint} style={{ marginLeft: '4px' }}>
                      (현재: {RECRUIT_STATUSES.find(r => r.key === session.recruitmentStatus)?.label || session.recruitmentStatus})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {sessionStates.length === 0 && (
            <div className={styles.emptyMsg}>설정된 세션이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
