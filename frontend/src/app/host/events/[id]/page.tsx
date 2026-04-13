'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';

// 인터페이스 정의
export interface HostEventDetail {
  id: number;
  title: string;
  thumbnailUrl: string;
  type: string;
  status: string;
  price: number;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  location: string;
  isOnline: boolean;
  description?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

export interface HostAttendee {
  orderId: number;
  userName: string;
  userEmail: string;
  orderedAt: string;
  status: string;
}

export default function HostEventDetailPage() {
  const params = useParams();
  const id = params.id;

  const [event, setEvent] = useState<HostEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'attendees' | 'rooms'>('info');

  // 수강생 관련 상태
  const [attendees, setAttendees] = useState<HostAttendee[]>([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<HostEventDetail>>(`/host/events/${id}`);
        setEvent(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || '데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'attendees' && id) {
      const fetchAttendees = async () => {
        try {
          setAttendeeLoading(true);
          const res = await api.get<ApiResponse<PageResponse<HostAttendee>>>(`/host/orders/attendees?eventId=${id}`);
          setAttendees(res.data.content);
        } catch (err) {
          console.error(err);
        } finally {
          setAttendeeLoading(false);
        }
      };
      fetchAttendees();
    }
  }, [activeTab, id]);

  const handleCloseRecruitment = async () => {
    if (!confirm('정말로 이 이벤트의 모집 상태를 변경하시겠습니까?')) return;
    try {
      await api.patch(`/host/events/${id}/close`, {});
      alert('상태가 변경되었습니다.');
      const res = await api.get<ApiResponse<HostEventDetail>>(`/host/events/${id}`);
      setEvent(res.data);
    } catch (err: any) {
      alert(err.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return '모집 중';
      case 'DRAFT': return '임시 저장';
      case 'PREPARING': return '강의 준비 중';
      case 'ONGOING': return '진행 중';
      case 'ENDED': return '종료됨';
      case 'CANCELLED': return '취소됨';
      default: return status;
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return '결제완료';
      case 'PENDING': return '대기중';
      case 'CANCELLED': return '취소됨';
      case 'REFUNDED': return '환불됨';
      default: return status;
    }
  };

  if (loading) return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar-content" style={{ scrollbarGutter: 'stable' }}>
        <div className={styles.loading}>페이지를 불러오는 중...</div>
      </div>
    </div>
  );

  if (error || !event) return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar-content" style={{ scrollbarGutter: 'stable' }}>
        <div className={styles.container}>
          <p style={{ color: '#ef4444' }}>{error || '이벤트를 찾을 수 없습니다.'}</p>
          <Link href="/host/events" className={styles.backLink}>← 세션 목록 보기</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar-content" style={{ scrollbarGutter: 'stable' }}>
        <div className={styles.container}>
        <div className={styles.topBar}>
          <Link href="/host/events" className={styles.backLink}>
            ← 세션 목록 보기
          </Link>
        </div>
        
        <div className={`${styles.statusBadge} ${styles[`status${event.status}`]}`}>
          {getStatusLabel(event.status)}
        </div>

        <h1 className={styles.title}>{event.title}</h1>

        {/* 탭 네비게이션 */}
        <nav className={styles.tabNav}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'info' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('info')}
          >
            기본 정보
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'attendees' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('attendees')}
          >
            수강생 관리
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'rooms' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            스터디룸 관리
          </button>
        </nav>

        {/* 탭 성격에 따른 컨텐츠 렌더링 */}
        <div className={styles.tabContent}>
          {activeTab === 'info' && (
            <div>
              <div className={styles.thumbnailWrapper}>
                <img 
                  src={event.thumbnailUrl || '/api/placeholder/800/450'} 
                  alt={event.title} 
                  className={styles.thumbnail}
                />
              </div>

              <section>
                <h2 className={styles.sectionHeader}>세션 정보</h2>
                <p className={styles.description}>
                  {event.description || '이 이벤트에 대한 상세 설명이 아직 등록되지 않았습니다.'}
                </p>
              </section>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <label>총 가격</label>
                  <div className="value">
                    {event.price === 0 ? '무료' : `₩${event.price.toLocaleString()}`}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <label>날짜</label>
                  <div className="value">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                   <label>장소</label>
                   <div className="value">
                     {event.isOnline ? '온라인' : event.location}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendees' && (
            <div>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className={styles.sectionHeader} style={{ marginBottom: 0 }}>신청자 목록 ({attendees.length})</h2>
              </header>

              {attendeeLoading ? (
                <div>목록을 불러오는 중...</div>
              ) : attendees.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>수강생명</th>
                        <th>이메일</th>
                        <th>신청일</th>
                        <th>상태</th>
                        <th>주문서</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((attendee) => (
                        <tr key={attendee.orderId}>
                          <td>{attendee.userName}</td>
                          <td>{attendee.userEmail}</td>
                          <td>{new Date(attendee.orderedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status' + attendee.status]}`}>
                              {getOrderStatusLabel(attendee.status)}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionGroup}>
                              <Link href={`/host/payments/${attendee.orderId}`} className={styles.detailLink}>
                                주문 상세
                              </Link>
                              <button 
                                className={styles.refundButton}
                                onClick={() => alert('환불 기능은 준비 중입니다.')}
                              >
                                환불
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.contentCard}>
                  <p>이 강의에 대한 신청 내역이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className={styles.contentCard}>
              <h2 className={styles.sectionHeader} style={{ color: '#0f172a' }}>스터디룸 관리</h2>
              <p>세션별 스터디룸 및 화상 회의 링크 관리 기능을 준비 중입니다.</p>
            </div>
          )}
        </div>

        {/* 하단 바: 관리 버튼 그룹 */}
        <div className={styles.bottomBar}>
          <Link href={`/host/events/${event.id}/edit`} className={styles.btnEdit}>
            정보 수정
          </Link>
          <button className={styles.btnStatus} onClick={handleCloseRecruitment}>
            {event.status === 'PUBLISHED' ? '모집 마감하기' : '모집 시작하기'}
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}
