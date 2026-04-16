'use client';

import React, { useState } from 'react';
import styles from './StatusPanel.module.css';

const STATUS_TO_ID: Record<string | number, number | null> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5,
  'AUTO': null
};

interface Session {
  id: number;
  title: string;
  recruitmentStatus: any; // Can be string or {code, label}
  sessionStatus: any;     // Can be string or {code, label}
  isRecruitmentClosed: boolean;
  forcedRecruitmentStatus?: string | null;
  forcedSessionStatus?: string | null;
}

interface StatusPanelProps {
  eventId: number;
  creatorId?: number;
  status: any; // Can be string or {code, label}
  sessions: Session[];
}

const EVENT_STATUSES = [
  { key: 2, label: '게시됨', color: '#3b82f6' },
  { key: 3, label: '진행 중', color: '#10b981' },
  { key: 4, label: '종료', color: '#6b7280' },
  { key: 5, label: '취소', color: '#ef4444' },
  { key: 'AUTO', label: '자동 (일정 기준)', color: '#8b5cf6' },
];

const RECRUIT_STATUSES = [
  { key: 1, label: '모집 대기', color: '#f59e0b' },
  { key: 2, label: '모집 중', color: '#10b981' },
  { key: 3, label: '모집 마감', color: '#ef4444' },
  { key: 'AUTO', label: '자동 (날짜/정원 기반)', color: '#8b5cf6' },
];

export default function StatusPanel({ eventId, status, sessions: initialSessions }: StatusPanelProps) {
  const [loading, setLoading] = useState(false);

  // 상태가 객체인 경우 ID를 추출, 아니면 그대로 사용
  const getCode = (s: any) => (s && typeof s === 'object') ? s.id : s;
  const getLabel = (s: any) => (s && typeof s === 'object') ? s.label : s;

  const [currentStatus, setCurrentStatus] = useState(getCode(status));
  const [sessionStates, setSessionStates] = useState(
    initialSessions.map(s => ({
      ...s,
      recruitmentStatus: getCode(s.recruitmentStatus) || 2, // Default to OPEN (2)
      sessionStatus: getCode(s.sessionStatus) || 2,     // Default to PUBLISHED (2)
      isRecruitmentClosed: s.isRecruitmentClosed,
      forcedRecruitmentStatus: getCode(s.forcedRecruitmentStatus) || null,
      forcedSessionStatus: getCode(s.forcedSessionStatus) || null,
    }))
  );

  // ── (이벤트 상태 변경 제거됨 - 세션 자동계산에 의존) ──

  // ── 세션 진행 상태 변경 ──
  const changeSessionStatus = async (sessionId: number, newStatus: string | number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/host/events/${eventId}/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: STATUS_TO_ID[newStatus] }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const updated = data?.data;
        setSessionStates(prev =>
          prev.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                sessionStatus: updated ? getCode(updated.sessionStatus) : (newStatus === 'AUTO' ? s.sessionStatus : newStatus),
                forcedSessionStatus: updated ? getCode(updated.forcedSessionStatus) : (newStatus === 'AUTO' ? null : newStatus),
              };
            }
            return s;
          })
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
  const changeRecruitmentStatus = async (sessionId: number, newStatus: string | number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/host/events/${eventId}/sessions/${sessionId}/recruitment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: STATUS_TO_ID[newStatus] }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const updated = data?.data;
        setSessionStates(prev =>
          prev.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                isRecruitmentClosed: updated ? updated.isRecruitmentClosed : (newStatus === 3),
                recruitmentStatus: updated ? getCode(updated.recruitmentStatus) : newStatus,
                forcedRecruitmentStatus: updated ? getCode(updated.forcedRecruitmentStatus) : (newStatus === 'AUTO' ? null : newStatus),
              };
            }
            return s;
          })
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
                      (현재: {EVENT_STATUSES.find(r => r.key === session.sessionStatus)?.label || getLabel(session.sessionStatus)})
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
                      (현재: {RECRUIT_STATUSES.find(r => r.key === session.recruitmentStatus)?.label || getLabel(session.recruitmentStatus)})
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
