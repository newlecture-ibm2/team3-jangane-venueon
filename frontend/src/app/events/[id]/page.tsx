export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Tag, Button } from '@/components/ui';
import { format } from 'date-fns';
import EventActionMenu from './_components/EventActionMenu';
import TicketList from './_components/TicketList';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API Fetch 함수
async function getEventDetail(id: string) {
  try {
    const url = `${BACKEND_URL}/events/${id}`;
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    if (!text.startsWith('{') && !text.startsWith('[')) {
      console.error(`Backend returned non-JSON response from ${url}:`, text);
      return { error: 'Non-JSON response', detail: text, url };
    }
    const data = JSON.parse(text);
    if (data.success) return data.data;
    return { error: 'Success false from backend', data };
  } catch (error: any) {
    console.error('Failed to fetch event details', error);
    return { error: 'Fetch catch err', message: error?.message };
  }
}

async function getTickets(eventId: string) {
  try {
    const url = `${BACKEND_URL}/events/${eventId}/tickets`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) return data.data || [];
    return [];
  } catch (error) {
    console.error('Failed to fetch tickets', error);
    return [];
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const [event, tickets] = await Promise.all([
    getEventDetail(id),
    getTickets(id),
  ]);

  if (!event || event.error) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>이벤트를 찾을 수 없거나 불러오지 못했습니다.</h2>
        <p>삭제되었거나 존재하지 않는 이벤트입니다.</p>
        <div style={{ marginTop: 20, color: 'red', textAlign: 'left', background: '#ffebee', padding: 16 }}>
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const STATUS_MAP: Record<string, { label: string; variant: 'green' | 'purple' | 'gray' | 'red' }> = {
    PUBLISHED: { label: '모집 중', variant: 'green' },
    ONGOING: { label: '진행 중', variant: 'purple' },
    DRAFT: { label: '게시 전', variant: 'gray' },
    ENDED: { label: '종료', variant: 'gray' },
    CANCELLED: { label: '취소', variant: 'red' },
  };

  const RECRUIT_MAP: Record<string, { label: string; variant: 'green' | 'purple' | 'gray' | 'red' }> = {
    OPEN: { label: '모집중', variant: 'green' },
    PENDING: { label: '모집 대기', variant: 'gray' },
    CLOSED: { label: '마감', variant: 'red' },
  };

  const statusInfo = STATUS_MAP[event.status] || { label: event.status, variant: 'gray' };
  const imageUrl = event.thumbnailUrl ? `/upload/${event.thumbnailUrl}` : '';

  // v6: 세션에서 이벤트 기간/장소 도출
  const sessions = event.sessions || [];
  const startDate = sessions.length > 0
    ? sessions.reduce((min: string, s: any) => s.startTime && s.startTime < min ? s.startTime : min, sessions[0]?.startTime || '')
    : null;
  const endDate = sessions.length > 0
    ? sessions.reduce((max: string, s: any) => s.endTime && s.endTime > max ? s.endTime : max, sessions[0]?.endTime || '')
    : null;

  // v6: 티켓에서 가격 범위 도출
  const activePrices = tickets.filter((t: any) => t.isActive).map((t: any) => t.price);
  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : 0;
  const hasDiscount = tickets.some((t: any) => t.discountRate > 0);

  return (
    <div className={styles.container}>

      {/* 뒤로 가기 바 */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backButton}>
          ← 이벤트 목록 보기
        </Link>
      </div>

      {/* 헤더 섹션 */}
      <div className={styles.headerSection}>
        <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{event.title}</h1>
          <EventActionMenu eventId={event.id.toString()} creatorId={event.creatorId} />
        </div>
      </div>

      {/* 썸네일 */}
      <div className={styles.thumbnailWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={event.title} className={styles.thumbnail} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            미리보기 이미지가 없습니다
          </div>
        )}
      </div>

      {/* 이벤트 정보 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>이벤트 정보</h3>
        <div className={styles.description}>
          {event.description}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>가격</span>
            <span className={styles.infoValue}>
              {minPrice === 0 && maxPrice === 0
                ? '무료'
                : minPrice === maxPrice
                  ? `₩${minPrice.toLocaleString()}`
                  : `₩${minPrice.toLocaleString()} ~ ₩${maxPrice.toLocaleString()}`
              }
              {hasDiscount && <span className={styles.discountLabel}> 할인</span>}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>일정</span>
            <span className={styles.infoValue}>
              {startDate
                ? `${format(new Date(startDate), 'yyyy.MM.dd')}${endDate ? ` ~ ${format(new Date(endDate), 'yyyy.MM.dd')}` : ''}`
                : '일정 미정'
              }
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>유형</span>
            <span className={styles.infoValue}>{event.type}</span>
          </div>
        </div>
      </section>

      {/* 세션 일정 섹션 */}
      {sessions.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            세션 일정 {event.hasSession ? `(${sessions.length}개 세션)` : ''}
          </h3>
          <div className={styles.sessionList}>
            {sessions.map((session: any, index: number) => {
              const recruitInfo = RECRUIT_MAP[session.recruitmentStatus] || { label: '—', variant: 'gray' };
              return (
                <div key={session.id || index} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <h4 className={styles.sessionTitle}>{session.title || `세션 ${index + 1}`}</h4>
                    <Tag variant={recruitInfo.variant}>{recruitInfo.label}</Tag>
                  </div>
                  {session.description && (
                    <p className={styles.sessionDesc}>{session.description}</p>
                  )}
                  <div className={styles.sessionMeta}>
                    <span>🕒 {session.startTime ? `${format(new Date(session.startTime), 'MM.dd HH:mm')} ~ ${format(new Date(session.endTime), 'HH:mm')}` : '시간 미정'}</span>
                    <span>🏫 {session.isOnline ? '온라인' : (session.location || '장소 미정')}</span>
                    <span>👤 {session.currentAttendees || 0} / {session.maxAttendees || '∞'} 명</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 티켓 선택 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>티켓 선택</h3>
        <TicketList tickets={tickets} sessions={sessions} eventStatus={event.status} />
      </section>

      {/* 주최자 정보 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>주최자 정보</h3>
        <div className={styles.hostCard}>
          <div className={styles.hostImageWrapper}>
            {event.host?.profileImg ? (
              <img src={`/upload/${event.host.profileImg}`} alt={event.host.orgName} className={styles.hostImage} />
            ) : (
              <div style={{ width: '100%', height: '100%' }} />
            )}
          </div>
          <div className={styles.hostInfo}>
            <h4 className={styles.hostName}>{event.host?.orgName || `Host ${event.creatorId}`}</h4>
            <p className={styles.hostDesc}>{event.host?.orgDescription || '주최자 소개가 없습니다.'}</p>
          </div>
        </div>
      </section>

      {/* 하단 액션 버튼 */}
      <div className={styles.bottomActionArea}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" size="large">이벤트 목록</Button>
        </Link>
      </div>

    </div>
  );
}
