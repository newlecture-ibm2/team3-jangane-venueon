import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './TabSection.module.css';
import { HostEventDetail, Attendee, SessionDetail } from '../../useEventDetail';

interface TabSectionProps {
  event: HostEventDetail;
  attendees: Attendee[];
  loadingAttendees: boolean;
  activeTab: 'BASIC' | 'ATTENDEES' | 'STUDY_ROOM' | 'STATS';
  setActiveTab: (tab: 'BASIC' | 'ATTENDEES' | 'STUDY_ROOM' | 'STATS') => void;
}

export const TabSection = ({
  event,
  attendees,
  loadingAttendees,
  activeTab,
  setActiveTab
}: TabSectionProps) => {
  const router = useRouter();

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('ko-KR', {
      month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
    });
  };

  const calculateAverageOccupancy = () => {
    if (!event || event.sessions.length === 0) return 0;
    const totalMax = event.sessions.reduce((acc: number, s) => acc + s.maxAttendees, 0);
    const totalCurrent = event.sessions.reduce((acc: number, s) => acc + s.currentAttendees, 0);
    return totalMax > 0 ? Math.round((totalCurrent / totalMax) * 100) : 0;
  };

  return (
    <>
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
          <>
            <section className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>강의 정보</h3>
              <div className={styles.descriptionText}>
                {event.description || '인공지능 시대의 마케팅 전략 세미나 코칭을 시작합니다. 이 교육 프로그램은 실전 경험을 잘 녹여 실무에 도움이 될 수 있도록 설계되었습니다. 이론에 그치지 않고 실제 현장에서 바로 적용 가능한 핵심 기술과 전략을 습득할 수 있는 기회입니다.'}
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>총 가격</span>
                  <div className={styles.infoValue}>
                    {event.hasDiscount && (
                      <span className={styles.originalPriceText}>
                        ₩{event.originalPrice.toLocaleString()}
                      </span>
                    )}
                    ₩{event.price.toLocaleString()}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>날짜</span>
                  <div className={styles.infoValue}>{new Date(event.sessions[0]?.startTime || event.createdAt).toLocaleDateString('ko-KR')}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>장소</span>
                  <div className={styles.infoValue}>{event.location || '서울특별시 강남구 테헤란로 512, 스카이 타워 18층'}</div>
                </div>
              </div>
            </section>

            <div className={styles.bottomActions}>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={() => setActiveTab('STUDY_ROOM')}>
                스터디 룸 입장
              </button>
              <button className={`${styles.btn} ${styles.primaryBtn}`} onClick={() => router.push(`/host/events/${event.id}/edit`)}>
                수정
              </button>
            </div>
          </>
        )}

        {activeTab === 'ATTENDEES' && (
          <section className={styles.sectionBox}>
            <h3 className={styles.sectionTitle}>👥 수강생 신청 현황</h3>
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

            <div style={{ marginTop: '56px' }}>
              <h3 className={styles.sectionTitle}>📋 상세 수강생 명단</h3>

              {loadingAttendees ? (
                <p>명단을 불러오는 중...</p>
              ) : attendees.length > 0 ? (
                <table className={styles.sessionTable}>
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>연락처</th>
                      <th>신청 세션</th>
                      <th>결제 금액</th>
                      <th>상태</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: '600' }}>{a.userName}</td>
                        <td>{a.email}</td>
                        <td>{a.phone}</td>
                        <td>{a.sessionTitle}</td>
                        <td>₩{a.paidAmount.toLocaleString()}</td>
                        <td>
                          <Link href={`/host/payments/${a.id}`} style={{ textDecoration: 'none' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: (a.status === 'PAID' || a.status === 'REGISTERED' || a.status === '결제완료') ? '#ecfdf5' : '#fef2f2',
                              color: (a.status === 'PAID' || a.status === 'REGISTERED' || a.status === '결제완료') ? '#059669' : '#dc2626',
                              cursor: 'pointer'
                            }}>
                              {a.status === 'PAID' ? '결제완료' : a.status === 'REGISTERED' ? '등록됨' : a.status}
                            </span>
                          </Link>
                        </td>
                        <td>
                          <button
                            className={styles.refundBtn}
                            onClick={() => alert(`${a.userName} 수강생의 환불 처리를 시작합니다.`)}
                          >
                            환불
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>
                  아직 수강 신청 인원이 없습니다.
                </div>
              )}
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
                  <th>상태</th>
                  <th>스터디 룸</th>
                </tr>
              </thead>
              <tbody>
                {event.sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.title}</td>
                    <td>{formatDateTime(s.startTime)} ~ {formatDateTime(s.endTime).split(' ').slice(-2).join(' ')}</td>
                    <td>{s.status?.label || '정상'}</td>
                    <td>
                      <button
                        style={{
                          padding: '6px 12px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => alert(`세션 [${s.title}]의 스터디 룸 관리 페이지로 이동합니다.`)}
                      >
                        스터디 룸 관리
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'STATS' && (
          <section className={styles.sectionBox}>
            <h3 className={styles.sectionTitle}>📊 현재 현황</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>총 매출액</span>
                <div className={styles.infoValue}>₩{event.totalRevenue.toLocaleString()}</div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>총 수강생</span>
                <div className={styles.infoValue}>{event.totalAttendees}명</div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>평균 예약율</span>
                <div className={styles.infoValue}>{calculateAverageOccupancy()}%</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};
