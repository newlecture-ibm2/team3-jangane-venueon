'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface RecentOrder {
  orderId: number;
  eventTitle: string;
  amount: number;
  orderedAt: string;
  status: string;
}

interface HostOrderSummary {
  currentMonthRevenue: number;
}

function getOrderStatusLabel(status: string) {
  switch (status) {
    case 'PAID':
      return '결제완료';
    case 'REGISTERED':
      return '신청완료';
    case 'CANCELLED':
      return '주문취소';
    case 'REFUNDED':
      return '환불완료';
    case 'PENDING':
      return '결제대기';
    default:
      return status;
  }
}

function getOrderStatusClass(status: string) {
  switch (status) {
    case 'PAID':
      return styles.orderStatusPaid;
    case 'REGISTERED':
      return styles.orderStatusRegistered;
    case 'CANCELLED':
      return styles.orderStatusCancelled;
    case 'REFUNDED':
      return styles.orderStatusRefunded;
    case 'PENDING':
      return styles.orderStatusPending;
    default:
      return styles.orderStatusDefault;
  }
}

function formatOrderDate(isoDateTime: string) {
  if (!isoDateTime) return '-';
  return isoDateTime.slice(0, 10);
}

export default function HostDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    publishedCount: 0,
    draftCount: 0,
    totalAttendees: 0, 
    totalRevenue: 0,
    pendingRefunds: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const publishedRes = await api.get<{ status: string; data: { totalElements: number } }>('/host/seminars?size=1');
        const draftRes = await api.get<{ status: string; data: { totalElements: number } }>('/host/seminars/drafts?size=1');
        const recentOrdersRes = await api.get<{ status: string; data: RecentOrder[] }>('/host/orders/recent?size=5');
        const orderSummaryRes = await api.get<{ status: string; data: HostOrderSummary }>('/host/orders/summary');
        
        setStats(prev => ({
          ...prev,
          publishedCount: publishedRes.data?.totalElements || 0,
          draftCount: draftRes.data?.totalElements || 0,
          totalRevenue: orderSummaryRes.data?.currentMonthRevenue || 0,
        }));
        setRecentOrders(recentOrdersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }
    fetchDashboardStats();
  }, []);

  return (
    <div className="container-sidebar">
      <div className={styles.sidebarWrapper}>
        <button 
          className={styles.mobileMenuButton} 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '닫기 ✕' : '메뉴 열기 ☰'}
        </button>
        
        <div className={`${styles.sidebarInner} ${isSidebarOpen ? styles.mobileOpen : styles.mobileClosed}`}>
          <Sidebar role="host" className={styles.responsiveHostSidebar} />
        </div>
      </div>
      
      <div className="sidebar">
        <div className={styles.dashboardWrapper}>
          
          <header className={styles.header}>
            <h1 className={styles.pageTitle}>호스트 대시보드</h1>
            <p className={styles.pageSubtitle}>환영합니다! 현재 개설하신 강의들의 현황을 한눈에 확인하세요.</p>
          </header>

          <section className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.revenueIcon}`}>💰</div>
              <p className={styles.cardTitle}>이번 달 누적 매출</p>
              <h2 className={styles.cardValue}>{stats.totalRevenue.toLocaleString()}원</h2>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.eventIcon}`}>📊</div>
              <p className={styles.cardTitle}>진행/게시 중인 이벤트</p>
              <h2 className={styles.cardValue}>{stats.publishedCount}개</h2>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.userIcon}`}>👥</div>
              <p className={styles.cardTitle}>총 누적 수강생</p>
              <h2 className={styles.cardValue}>{stats.totalAttendees}명</h2>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.refundIcon}`}>⚠️</div>
              <p className={styles.cardTitle}>환불 요청 대기</p>
              <h2 className={styles.cardValue}>{stats.pendingRefunds}건</h2>
            </div>
          </section>

          <div className={styles.sectionsGrid}>
            <section className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>최근 주문 내역</h3>
                <Link href="/host/payments" className={styles.viewAllBtn}>전체 보기 &gt;</Link>
              </div>
              
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>강의명</th>
                      <th>주문금액</th>
                      <th>주문일</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.orderId}>
                        <td>#{order.orderId}</td>
                        <td>{order.eventTitle}</td>
                        <td>{order.amount.toLocaleString()}원</td>
                        <td>{formatOrderDate(order.orderedAt)}</td>
                        <td>
                          <span className={`${styles.orderStatus} ${getOrderStatusClass(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                          주문 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>빠른 작업</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/host/seminars/new" className="button" style={{ 
                  background: '#1e293b', color: 'white', padding: '16px', borderRadius: '8px', 
                  textAlign: 'center', textDecoration: 'none', fontWeight: '600' 
                }}>
                  + 새로운 강의 개설하기
                </Link>
                <Link href="/host/seminars" className="button" style={{ 
                  background: '#f1f5f9', color: '#1e293b', padding: '16px', borderRadius: '8px', 
                  textAlign: 'center', textDecoration: 'none', fontWeight: '600' 
                }}>
                  내 강의 목록 관리
                </Link>
                <Link href="/host/requests" className="button" style={{ 
                  background: '#f1f5f9', color: '#1e293b', padding: '16px', borderRadius: '8px', 
                  textAlign: 'center', textDecoration: 'none', fontWeight: '600' 
                }}>
                  운영팀에 요청하기
                </Link>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
