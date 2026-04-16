export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Tag, Button } from '@/components/ui';
import { format } from 'date-fns';
import ActionMenu from './_components/ActionMenu/ActionMenu';
import TicketList from './_components/TicketList/TicketList';
import SessionList from './_components/SessionList/SessionList';
import ReviewSection from './_components/ReviewSection/ReviewSection';
import { BackButton } from '@/components/ui';

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

  const STATUS_VARIANTS: Record<number, { variant: 'green' | 'purple' | 'gray' | 'red' }> = {
    1: { variant: 'gray' }, // DRAFT
    2: { variant: 'green' }, // PUBLISHED
    3: { variant: 'purple' }, // ONGOING
    4: { variant: 'gray' }, // ENDED
    5: { variant: 'red' }, // CANCELLED
  };

  const RECRUIT_VARIANTS: Record<number, { variant: 'green' | 'purple' | 'gray' | 'red' }> = {
    1: { variant: 'gray' }, // PENDING
    2: { variant: 'green' }, // OPEN
    3: { variant: 'red' }, // CLOSED
  };

  const statusVariant = STATUS_VARIANTS[event.status?.id]?.variant || 'gray';
  const imageUrl = event.thumbnailUrl ? `/upload/${event.thumbnailUrl}` : '';

  // v6: 이벤트 기간은 백엔드의 Computed 필드(event.startDate, event.endDate) 또는 세션 도출을 사용
  const sessions = event.sessions || [];
  const startDate = event.startDate;
  const endDate = event.endDate;

  // 모집 기간 도출
  const validRecruitStartDates = sessions.map((s: any) => s.recruitStartDate).filter(Boolean).map((d: string) => new Date(d).getTime());
  const validRecruitEndDates = sessions.map((s: any) => s.recruitEndDate).filter(Boolean).map((d: string) => new Date(d).getTime());

  const recruitStartDate = validRecruitStartDates.length > 0 ? new Date(Math.min(...validRecruitStartDates)).toISOString() : null;
  const recruitEndDate = validRecruitEndDates.length > 0 ? new Date(Math.max(...validRecruitEndDates)).toISOString() : null;

  // v6: 티켓에서 가격 범위 도출
  const activePrices = tickets.filter((t: any) => t.isActive).map((t: any) => t.price);
  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : 0;
  const hasDiscount = tickets.some((t: any) => t.discountRate > 0);

  return (
    <div className={styles.container}>

      {/* 뒤로 가기 바 */}
      <div className={styles.topBar}>
        <BackButton />
      </div>



      {/* 헤더 섹션 — 듀얼 뱃지 */}
      <div className={styles.headerSection}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 모집상태 뱃지 */}
          {event.recruitmentStatus && (
            <Tag variant={RECRUIT_VARIANTS[event.recruitmentStatus?.id]?.variant || 'gray'}>
              {event.recruitmentStatus?.label}
            </Tag>
          )}
          {/* 강의상태 뱃지 (DRAFT/PUBLISHED는 숨김) */}
          {event.status && event.status.id !== 1 && event.status.id !== 2 && (
            <Tag variant={statusVariant}>{event.status?.label}</Tag>
          )}
        </div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{event.title}</h1>
          <ActionMenu eventId={event.id.toString()} creatorId={event.creatorId} />
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
        {event.detailContent && (
          <div
            className={styles.richContent}
            dangerouslySetInnerHTML={{ __html: event.detailContent }}
          />
        )}

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
            <span className={styles.infoValue} suppressHydrationWarning>
              {startDate
                ? `${format(new Date(startDate), 'yyyy.MM.dd')}${endDate ? ` ~ ${format(new Date(endDate), 'yyyy.MM.dd')}` : ''}`
                : '일정 미정'
              }
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>모집</span>
            <span className={styles.infoValue} suppressHydrationWarning>
              {recruitStartDate || recruitEndDate
                ? `${recruitStartDate ? format(new Date(recruitStartDate), 'yyyy.MM.dd') : '상시 모집'} ~ ${recruitEndDate ? format(new Date(recruitEndDate), 'yyyy.MM.dd') : '상시 모집'}`
                : '상시 모집'
              }
              <span style={{ marginLeft: '8px' }}>
                <Tag variant={RECRUIT_VARIANTS[event.recruitmentStatus?.id]?.variant || 'gray'}>
                  {event.recruitmentStatus?.label || '모집 상태 미정'}
                </Tag>
              </span>
            </span>
          </div>

        </div>
      </section>

      {/* 세션 일정 섹션 — 복합 이벤트(다중 세션)일 때만 노출 */}
      {event.hasSession && sessions.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            세션 일정 ({sessions.length}개 세션)
          </h3>
          <SessionList sessions={sessions} />
        </section>
      )}

      {/* 티켓 선택 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>티켓 선택</h3>
        <TicketList tickets={tickets} sessions={sessions} eventStatusId={event.status?.id || 1} />
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

      {/* 수강생 후기 섹션 */}
      <section id="review-section" className={styles.section}>
        <ReviewSection eventId={Number(event.id)} eventTitle={event.title} />
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
