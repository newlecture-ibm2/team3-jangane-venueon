export const dynamic = 'force-dynamic';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { Tag, Button } from '@/components/ui';
import { format } from 'date-fns';
import EventActionMenu from './_components/EventActionMenu';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API Fetch 함수
async function getEventDetail(id: string) {
  try {
    const url = `${BACKEND_URL}/events/${id}`;
    const res = await fetch(url, {
      cache: 'no-store'
    });

    const text = await res.text();
    // 응답이 JSON 형식이 아닌 경우 로깅
    if (!text.startsWith('{') && !text.startsWith('[')) {
      console.error(`Backend returned non-JSON response from ${url}:`, text);
      return { error: 'Non-JSON response', detail: text, url };
    }

    const data = JSON.parse(text);
    if (data.success) {
      return data.data;
    }
    return { error: 'Success false from backend', data };
  } catch (error: any) {
    console.error('Failed to fetch event details', error);
    return { error: 'Fetch catch err', message: error?.message };
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventDetail(id);

  console.log("EVENT PAYLOAD FROM BACKEND:", JSON.stringify(event, null, 2));

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

  const statusInfo = STATUS_MAP[event.status] || { label: event.status, variant: 'gray' };
  const imageUrl = event.thumbnailUrl ? `${BACKEND_URL}/upload/${event.thumbnailUrl}` : '';

  return (
    <div className={styles.container}>

      {/* 뒤로 가기 바 */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backButton}>
          ← 강의 목록 보기
        </Link>
      </div>

      {/* 헤더 섹션 (상태 태그, 제목, 액션 버튼) */}
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

      {/* 강의 정보 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>강의 정보</h3>
        <div className={styles.description}>
          {event.description}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>총 가격</span>
            <span className={styles.infoValue}>
              {event.price === 0 ? '무료' : `₩${event.price.toLocaleString()}`}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>날짜</span>
            <span className={styles.infoValue}>
              {format(new Date(event.startDate), 'yyyy-MM-dd')}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>장소</span>
            <span className={styles.infoValue}>
              {event.isOnline ? '온라인 이벤트' : event.location}
            </span>
          </div>
        </div>
      </section>

      {/* 다중 세션 정보 섹션 (있는 경우에만 표시) */}
      {event.hasSession && event.sessions && event.sessions.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            세션 일정 ({event.purchaseType === 'PACKAGE' ? '패키지(전체 필수 수강)' : '선택형 수강'})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {event.sessions.map((session: any, index: number) => (
              <div key={session.id || index} style={{ border: '1px solid #eaeaea', padding: '16px', borderRadius: '12px', background: '#fafafa' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{session.title || `세션 ${index + 1}`}</h4>
                {session.description && (
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                    {session.description}
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#333' }}>
                  <span>🕒 <strong>시간:</strong> {format(new Date(session.startTime), 'MM-dd HH:mm')} ~ {format(new Date(session.endTime), 'HH:mm')}</span>
                  <span>🏫 <strong>장소:</strong> {session.isOnline ? '온라인' : session.location}</span>
                  <span>💰 <strong>가격:</strong> {session.price === 0 ? '무료' : `₩${session.price.toLocaleString()}`}</span>
                  <span>👤 <strong>인원:</strong> {session.currentAttendees} / {session.maxAttendees} 명</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 주최자 정보 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>주최자 정보</h3>
        <div className={styles.hostCard}>
          <div className={styles.hostImageWrapper}>
            {event.host?.profileImg ? (
              <img src={`${BACKEND_URL}/upload/company-logo/${event.host.profileImg}`} alt={event.host.orgName} className={styles.hostImage} />
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
          <Button variant="outlined" size="large">강의 목록</Button>
        </Link>
        {event.status === 'PUBLISHED' ? (
          <Link href={`/orders/checkout?eventId=${id}&quantity=1`} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="large">
              수강 신청
            </Button>
          </Link>
        ) : (
          <Button variant="primary" size="large" disabled>
            신청 불가
          </Button>
        )}
      </div>

    </div>
  );
}
