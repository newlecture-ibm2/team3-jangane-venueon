'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface HostEventDetail {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  type: string;
  status: string;
  price: number;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  location: string;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HostEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();

  const [eventData, setEventData] = useState<HostEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('INFO');

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  const fetchEventDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: HostEventDetail }>(`/host/events/${eventId}`);
      if (res.data) {
        const actualData = (res.data as any).success !== undefined ? (res.data as any).data : res.data;
        setEventData(actualData);
      }
    } catch (err: any) {
      console.error('Failed to fetch event details', err);
      setError('세션 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (!confirm(`이벤트 상태를 [${newStatus}] 으/로 변경하시겠습니까?`)) return;
      await api.patch(`/host/events/${eventId}/status?status=${newStatus}`);
      alert('상태가 변경되었습니다.');
      fetchEventDetail();
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await api.delete(`/host/events/${eventId}`);
      alert('삭제되었습니다.');
      router.push('/host/events');
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return '임시 저장';
      case 'PUBLISHED': return '모집 중';
      case 'ONGOING': return '진행 중';
      case 'ENDED': return '종료됨';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container-sidebar">
        <Sidebar role="host" />
        <main className="sidebar">
          <div className={styles.dashboardWrapper}>데이터를 불러오는 중입니다...</div>
        </main>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="container-sidebar">
        <Sidebar role="host" />
        <main className="sidebar">
          <div className={styles.dashboardWrapper} style={{ color: 'red' }}>{error || '데이터가 없습니다.'}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      
      <main className="sidebar">
        <div className={styles.dashboardWrapper}>
          
          <div className={styles.breadcrumb}>
            내 강의 목록
          </div>
          
          <span className={styles.badge}>{getStatusText(eventData.status)}</span>
          <h1 className={styles.eventTitle}>{eventData.title}</h1>

          <div className={styles.tabs}>
            <div 
              className={`${styles.tab} ${activeTab === 'INFO' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('INFO')}
            >
              기본 정보
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'USERS' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('USERS')}
            >
              수강생 관리
            </div>
          </div>

          {activeTab === 'INFO' && (
            <>
              {eventData.thumbnailUrl ? (
                <img 
                  src={`${BACKEND_URL}/upload/${eventData.thumbnailUrl}`} 
                  alt="Thumbnail" 
                  className={styles.thumbnailImage} 
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  등록된 썸네일 이미지가 없습니다
                </div>
              )}

              <h3 className={styles.sectionTitle}>강의 정보</h3>
              <div className={styles.descContent}>
                {eventData.description || '작성된 상세 설명이 없습니다.'}
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>총 가격</span>
                  <span className={styles.infoValue}>
                    {eventData.price === 0 ? '무료' : `₩${eventData.price.toLocaleString()}`}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>날짜</span>
                  <span className={styles.infoValue}>
                    {new Date(eventData.startDate).toISOString().split('T')[0]}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>장소</span>
                  <span className={styles.infoValue}>
                    {eventData.isOnline ? '온라인 전용' : (eventData.location || '장소 미정')}
                  </span>
                </div>
              </div>

              <div className={styles.hostSection}>
                <h3 className={styles.sectionTitle}>주최자 정보</h3>
                <div className={styles.hostInfoRow}>
                  <div className={styles.hostLogo}></div>
                  <div className={styles.hostText}>
                    <span className={styles.hostName}>데이터마인드 크리에이티브</span>
                    <span className={styles.hostDesc}>데이터를 넘어 마케팅의 본질을 꿰뚫는 AI 전략 그룹으로 실무 마케터들의 AI 전환(AI Transformation) 가속화 및 실용적 생산성 도구를 보급합니다.</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionArea}>
                {eventData.status === 'DRAFT' && (
                  <button className={`${styles.btn} ${styles.btnBlue}`} onClick={() => handleStatusChange('PUBLISHED')}>
                    공개하기 (PUBLISHED)
                  </button>
                )}
                {eventData.status === 'PUBLISHED' && (
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleStatusChange('ENDED')}>
                    종료하기 (ENDED)
                  </button>
                )}
                
                <button className={`${styles.btn} ${styles.btnPrimary}`}>
                  스터디룸 입장
                </button>
                <Link href={`/host/events/${eventId}/edit`}>
                  <button className={`${styles.btn} ${styles.btnOutline}`}>수정</button>
                </Link>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                  삭제
                </button>
              </div>
            </>
          )}

          {activeTab === 'USERS' && (
            <div style={{ padding: '40px 0', color: '#666' }}>
              수강생 관리 화면이 준비 중입니다.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
