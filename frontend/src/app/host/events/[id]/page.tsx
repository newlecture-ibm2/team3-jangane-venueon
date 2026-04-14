'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface SessionDetail {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  status: { id: number; name: string } | null;
}

interface HostEventDetail {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: { id: number; name: string } | null;
  status: { id: number; name: string } | null;
  createdAt: string;
   totalRevenue: number;
  totalAttendees: number;
  sessions: SessionDetail[];
}

export default function HostEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<HostEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'BASIC' | 'ATTENDEES' | 'STUDY_ROOM' | 'STATS'>('BASIC');

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const response = await api.get<{ status: string; data: HostEventDetail }>(`/host/events/${eventId}`);
        if (response.data) {
          setEvent(response.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch event detail:', err);
        setError('강의 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (eventId) {
      fetchDetail();
    }
  }, [eventId]);

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('ko-KR', {
      month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
    });
  };

  const calculateTotalAttendees = () => {
    if (!event) return 0;
    return event.sessions.reduce((acc, s) => acc + s.currentAttendees, 0);
  };

  const calculateAverageOccupancy = () => {
    if (!event || event.sessions.length === 0) return 0;
    const totalMax = event.sessions.reduce((acc, s) => acc + s.maxAttendees, 0);
    const totalCurrent = calculateTotalAttendees();
    return totalMax > 0 ? Math.round((totalCurrent / totalMax) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
        <Sidebar role="host" />
        <main className="sidebar">
          <div className={styles.container}>
            <div className={styles.loadingWrapper}>강의 정보를 불러오는 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
        <Sidebar role="host" />
        <main className="sidebar">
          <div className={styles.container}>
            <div className={styles.errorWrapper}>
              <p>{error || '강의를 찾을 수 없습니다.'}</p>
              <Link href="/host/events">← 목록으로 돌아가기</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
      <Sidebar role="host" />
      <main className="sidebar">
        <div className={styles.container}>
          <header className={styles.header}>
            <Link href="/host/events" className={styles.backLink}>
              ← 전체 강의 목록으로 돌아가기
            </Link>
            <div className={styles.titleSection}>
              <div>
                <h1 className={styles.pageTitle}>{event.title}</h1>
                <span className={`${styles.statusBadge} ${styles[`status${event.status?.name || 'DRAFT'}`]}`}>
                  {event.status?.name === 'PUBLISHED' ? '모집 중' : 
                   event.status?.name === 'DRAFT' ? '임시 저장' : event.status?.name || '기타'}
                </span>
              </div>
              <div className={styles.actionButtons}>
                <button className={`${styles.btn} ${styles.secondaryBtn}`}>강의 수정</button>
                <button className={`${styles.btn} ${styles.primaryBtn}`}>게시 중단</button>
              </div>
            </div>
          </header>

          <div className={styles.tabsWrapper}>
            <div className={styles.tabsContainer}>
              <button className={`${styles.tabBtn} ${activeTab === 'BASIC' ? styles.activeTab : ''}`} onClick={() => setActiveTab('BASIC')}>기본정보</button>
              <button className={`${styles.tabBtn} ${activeTab === 'ATTENDEES' ? styles.activeTab : ''}`} onClick={() => setActiveTab('ATTENDEES')}>수강생 관리</button>
              <button className={`${styles.tabBtn} ${activeTab === 'STUDY_ROOM' ? styles.activeTab : ''}`} onClick={() => setActiveTab('STUDY_ROOM')}>스터디 룸 관리</button>
              <button className={`${styles.tabBtn} ${activeTab === 'STATS' ? styles.activeTab : ''}`} onClick={() => setActiveTab('STATS')}>현황</button>
            </div>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'BASIC' && (
              <div className={styles.basicInfoVertical}>
                <section className={styles.sectionBox}>
                  <h3 className={styles.sectionTitle}>🖼️ 썸네일 이미지</h3>
                  {event.thumbnailUrl ? (
                    <img src={event.thumbnailUrl} alt="Thumbnail" className={styles.thumbnailPreviewLarge} />
                  ) : (
                    <div className={styles.thumbnailPlaceholderLarge}>등록된 이미지가 없습니다.</div>
                  )}
                </section>

                <section className={styles.sectionBox}>
                  <h3 className={styles.sectionTitle}>ℹ️ 강의 기본 정보</h3>
                  <div className={styles.infoGrid2Col}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>강의명</span>
                      <span className={styles.infoValue}>{event.title}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>카테고리</span>
                      <span className={styles.infoValue}>{event.category?.name || '미지정'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>생성일</span>
                      <span className={styles.infoValue}>{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={styles.infoRow} style={{ marginTop: '20px' }}>
                    <span className={styles.infoLabel}>강의 설명</span>
                    <p className={styles.descriptionText}>{event.description || '설명이 없습니다.'}</p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'ATTENDEES' && (
              <section className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>👥 수강생 신청 현황 (세션별)</h3>
                <table className={styles.sessionTable}>
                  <thead>
                    <tr>
                      <th>세션명</th>
                      <th>신청 인원</th>
                      <th>정원</th>
                      <th>현재 공석</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.title}</td>
                        <td style={{ fontWeight: 'bold', color: '#2563eb' }}>{s.currentAttendees}명</td>
                        <td>{s.maxAttendees}명</td>
                        <td>{s.maxAttendees - s.currentAttendees}석</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button className={styles.secondaryBtn} onClick={() => alert('준비 중인 기능입니다.')}>상세 명단 내보내기 (CSV)</button>
                </div>
              </section>
            )}

            {activeTab === 'STUDY_ROOM' && (
              <section className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>📅 세션 및 스터디 룸 일정</h3>
                <table className={styles.sessionTable}>
                  <thead>
                    <tr>
                      <th>세션 명</th>
                      <th>일시</th>
                      <th>장소</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.title}</td>
                        <td>{formatDateTime(s.startTime)} ~ {formatDateTime(s.endTime).split(' ').slice(-2).join(' ')}</td>
                        <td>{s.location || '온라인'}</td>
                        <td>{s.status?.name || '정상'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'STATS' && (
              <div className={styles.statsLayout}>
                <section className={styles.statsSummaryGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>총 매출액</span>
                    <h2 className={styles.statValue}>₩{event.totalRevenue.toLocaleString()}</h2>
                    <p className={styles.statSub}>현재 확정된 결제 금액입니다.</p>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>총 수강 신청</span>
                    <h2 className={styles.statValue}>{event.totalAttendees}명</h2>
                    <p className={styles.statSub}>실제 결제 완료 인원 기준입니다.</p>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>평균 예약율</span>
                    <h2 className={styles.statValue}>{calculateAverageOccupancy()}%</h2>
                    <p className={styles.statSub}>정원 대비 신청 비중입니다.</p>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>활성 세션</span>
                    <h2 className={styles.statValue}>{event.sessions.length}개</h2>
                    <p className={styles.statSub}>진행 중인 세션 개수입니다.</p>
                  </div>
                </section>
                {/* 정합성 검토 알림 제거 */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
