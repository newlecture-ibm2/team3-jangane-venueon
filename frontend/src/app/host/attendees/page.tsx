'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from '../page.module.css';

interface Attendee {
  orderId: number;
  userName: string;
  userEmail: string;
  eventTitle: string;
  amount: number;
  orderedAt: string;
  status: string;
}

interface PageData {
  content: Attendee[];
  totalElements: number;
}

interface HostEvent {
  id: number;
  title: string;
}

export default function HostAttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 필터 상태
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');

  // 내 강의 목록 가져오기 (드롭다운 용)
  useEffect(() => {
    async function fetchHostEvents() {
      try {
        const response = await api.get<{ status: string; data: { content: HostEvent[] } }>('/host/events?size=100');
        setEvents(response.data.content || []);
      } catch (error) {
        console.error('Failed to fetch host events:', error);
      }
    }
    fetchHostEvents();
  }, []);

  // 수강생 목록 가져오기 (필터 포함)
  useEffect(() => {
    async function fetchAttendees() {
      setIsLoading(true);
      try {
        let url = '/host/orders/attendees?size=50';
        if (selectedEventId) url += `&eventId=${selectedEventId}`;
        if (searchName) url += `&name=${encodeURIComponent(searchName)}`;

        const response = await api.get<{ status: string; data: PageData }>(url);
        setAttendees(response.data.content || []);
        setTotalCount(response.data.totalElements || 0);
      } catch (error) {
        console.error('Failed to fetch attendees:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAttendees();
  }, [selectedEventId, searchName]);

  return (
    <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
      <div className={styles.sidebarWrapper}>
         <Sidebar role="host" />
      </div>
      
      <div className="sidebar">
        <div className={styles.dashboardWrapper}>
          
          <header className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/host" style={{ textDecoration: 'none', color: '#64748b' }}>← 대시보드로 돌아가기</Link>
            </div>
            <h1 className={styles.pageTitle}>총 누적 수강생 관리</h1>
            <p className={styles.pageSubtitle}>현재까지 내 강의를 신청한 모든 수강생 목록입니다. (총 {totalCount}명)</p>
          </header>

          <section className={styles.sectionBox}>
            {/* 필터 바 추가 */}
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>강의별 필터</label>
                <select 
                  className={styles.selectBox}
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">모든 강의 보기</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>수강생 이름 검색</label>
                <input 
                  type="text" 
                  className={styles.searchBox}
                  placeholder="수강생 이름을 입력하세요..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={`${styles.table} ${styles.attendeeTable}`}>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>수강 강의</th>
                    <th>결제 금액</th>
                    <th>신청일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((item) => (
                    <tr key={item.orderId}>
                      <td style={{ fontWeight: '600' }}>{item.userName}</td>
                      <td style={{ color: '#64748b' }}>{item.userEmail}</td>
                      <td>{item.eventTitle}</td>
                      <td>{item.amount.toLocaleString()}원</td>
                      <td>{item.orderedAt.slice(0, 10)}</td>
                      <td>
                        <span className={styles.orderStatus} style={{ 
                            background: item.status === 'PAID' ? '#dcfce7' : '#f1f5f9',
                            color: item.status === 'PAID' ? '#16a34a' : '#64748b'
                        }}>
                          {item.status === 'PAID' ? '결제완료' : '신청완료'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && attendees.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        검색 조건에 맞는 수강생 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        수강생 목록을 불러오는 중입니다...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
