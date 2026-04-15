'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Table, TableHeader, TableRow, TableCell, StatusTag } from '@/components/ui';
import styles from './page.module.css';

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
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar-content">
        <div className={styles.container}>
          
          <header className={styles.header}>
            <div style={{ marginBottom: '8px' }}>
              <Link href="/host" className={styles.backLink}>← 대시보드로 돌아가기</Link>
            </div>
            <h1 className={styles.pageTitle}>총 누적 수강생 관리</h1>
            <p className={styles.pageSubtitle}>현재까지 내 강의를 신청한 모든 수강생 목록입니다. (총 {totalCount}명)</p>
          </header>

          <div className={styles.contentBox}>
            {/* 필터 바 */}
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

            <Table columns="80px 160px minmax(0, 1fr) 100px 100px 80px">
              <TableHeader>
                <TableCell header>이름</TableCell>
                <TableCell header>이메일</TableCell>
                <TableCell header>수강 강의</TableCell>
                <TableCell header>결제 금액</TableCell>
                <TableCell header>신청일</TableCell>
                <TableCell header>상태</TableCell>
              </TableHeader>
              {isLoading ? (
                <TableRow>
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    수강생 목록을 불러오는 중입니다...
                  </div>
                </TableRow>
              ) : attendees.length > 0 ? (
                attendees.map((item) => (
                  <TableRow key={item.orderId}>
                    <TableCell>{item.userName}</TableCell>
                    <TableCell>{item.userEmail}</TableCell>
                    <TableCell>{item.eventTitle}</TableCell>
                    <TableCell>{item.amount.toLocaleString()}원</TableCell>
                    <TableCell>{item.orderedAt?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <StatusTag domain="payment" status={item.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    검색 조건에 맞는 수강생 내역이 없습니다.
                  </div>
                </TableRow>
              )}
            </Table>
          </div>

        </div>
      </div>
    </div>
  );
}
