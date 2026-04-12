'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Tag } from '@/components/ui';

interface Session {
  id: number;
  title: string;
  recruitmentStatus: string;
  isRecruitmentClosed: boolean;
}

interface HostManagementPanelProps {
  eventId: number;
  status: string;
  sessions: Session[];
}

export default function HostManagementPanel({ eventId, status, sessions }: HostManagementPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 현재 사용자 역할을 임시로 HOST로 가정하고 X-User-Id=1 설정 (추후 Auth 연동)
  const currentUserId = 1; 

  const updateEventStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/host/events/${eventId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'X-User-Id': currentUserId.toString(),
          'X-User-Role': 'HOST'
        }
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('상태 변경 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecruitment = async (sessionId: number, currentClosed: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/host/events/${eventId}/sessions/${sessionId}/recruitment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId.toString(),
          'X-User-Role': 'HOST'
        },
        body: JSON.stringify({ closed: !currentClosed })
      });
      if (res.ok) {
        router.refresh();
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
    <div style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>⚙️ 호스트 관리 패널</h3>
          <Tag variant={status === 'PUBLISHED' || status === 'ONGOING' ? 'green' : 'gray'}>
            현재 상태: {status}
          </Tag>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {status === 'DRAFT' && (
            <Button variant="primary" onClick={() => updateEventStatus('PUBLISHED')} disabled={loading}>
              게시하기 ▶
            </Button>
          )}
          {(status === 'PUBLISHED' || status === 'ONGOING') && (
            <Button variant="outlined" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => updateEventStatus('CANCELLED')} disabled={loading}>
              이벤트 취소
            </Button>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#475569' }}>세션별 모집 관리</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sessions.map((session, idx) => (
            <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                세션 {idx + 1}: {session.title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: session.recruitmentStatus === 'CLOSED' ? '#ef4444' : '#10b981' }}>
                  {session.recruitmentStatus}
                </span>
                <Button 
                  variant="outlined" 
                  onClick={() => toggleRecruitment(session.id, session.isRecruitmentClosed)}
                  disabled={loading}
                >
                  {session.isRecruitmentClosed ? '재오픈' : '수동 마감'}
                </Button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>설정된 세션이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}
