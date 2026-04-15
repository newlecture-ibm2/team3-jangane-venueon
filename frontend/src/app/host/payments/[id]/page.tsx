'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';

interface OrderDetail {
  orderId: number;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string | null;
  orderedAt: string;
  paidAt: string | null;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  eventId: number;
  eventTitle: string;
  eventThumbnailUrl: string | null;
  sessionTitle: string | null;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PAID': return '결제완료';
    case 'REGISTERED': return '신청완료';
    case 'CANCELLED': return '주문취소';
    case 'REFUNDED': return '환불완료';
    case 'PENDING': return '결제대기';
    default: return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'PAID': return styles.statusPaid;
    case 'REGISTERED': return styles.statusRegistered;
    case 'CANCELLED': return styles.statusCancelled;
    case 'REFUNDED': return styles.statusRefunded;
    case 'PENDING': return styles.statusPending;
    default: return styles.statusDefault;
  }
}

function getPaymentMethodLabel(method: string | null) {
  if (!method) return '-';
  switch (method) {
    case 'CARD': return '카드 결제';
    case 'VIRTUAL_ACCOUNT': return '가상계좌(무통장입금)';
    case 'TRANSFER': return '계좌이체';
    case 'PHONE': return '휴대폰 결제';
    case 'FREE': return '무료';
    default: return method;
  }
}

function formatDateTime(iso: string | null) {
  if (!iso) return '-';
  return iso.replace('T', ' ').slice(0, 16);
}

export default function HostOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetail() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<{ status: string; data: OrderDetail }>(`/host/orders/${orderId}`);
        if (response.data) {
          setOrder(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch order detail:', err);
        setError('주문 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return (
    <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
        <div className="sidebar"><Sidebar role="host" /></div>
        <div className="sidebar-content">
          <div className={styles.loadingWrapper}>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
    <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
        <div className="sidebar"><Sidebar role="host" /></div>
        <div className="sidebar-content">
          <div className={styles.errorWrapper}>
            <p>{error || '주문을 찾을 수 없습니다.'}</p>
            <Link href="/host/payments">← 목록으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
      <div className="sidebar">
        <Sidebar role="host" />
      </div>

      <div className="sidebar-content">
        <div className={styles.container}>
          <header className={styles.header}>
            <Link href="/host/payments" className={styles.backLink}>
              ← 전체 주문 내역으로 돌아가기
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className={styles.pageTitle}>주문 상세</h1>
                <span className={styles.orderIdBadge}>주문번호 #{order.orderId}</span>
              </div>
              <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </header>

          <div className={styles.detailGrid}>
            {/* 주문자 정보 */}
            <div className={styles.detailCard}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>👤</span>
                주문자 정보
              </h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>이름</span>
                <span className={styles.infoValue}>{order.userName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>이메일</span>
                <span className={styles.infoValue}>{order.userEmail}</span>
              </div>
              {order.userPhone && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>연락처</span>
                  <span className={styles.infoValue}>{order.userPhone}</span>
                </div>
              )}
            </div>

            {/* 결제 정보 */}
            <div className={styles.detailCard}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>💳</span>
                결제 정보
              </h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>결제 금액</span>
                <span className={`${styles.infoValue} ${styles.amountHighlight}`}>
                  {order.amount.toLocaleString()}원
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>수량</span>
                <span className={styles.infoValue}>{order.quantity}매</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>결제 수단</span>
                <span className={styles.infoValue}>{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
              {order.paidAt && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>결제 일시</span>
                  <span className={styles.infoValue}>{formatDateTime(order.paidAt)}</span>
                </div>
              )}
            </div>

            {/* 강의 정보 */}
            <div className={`${styles.detailCard} ${styles.detailCardFull}`}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📚</span>
                강의 정보
              </h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>강의명</span>
                <span className={styles.infoValue}>
                  <Link href={`/host/events/${order.eventId}`} className={styles.eventLink}>
                    {order.eventTitle}
                  </Link>
                </span>
              </div>
              {order.sessionTitle && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>선택 세션</span>
                  <span className={styles.infoValue}>{order.sessionTitle}</span>
                </div>
              )}
              {order.sessionStartTime && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>세션 일정</span>
                  <span className={styles.infoValue}>
                    {formatDateTime(order.sessionStartTime)} ~ {formatDateTime(order.sessionEndTime)}
                  </span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>주문 일시</span>
                <span className={styles.infoValue}>{formatDateTime(order.orderedAt)}</span>
              </div>
            </div>
          </div>

          {/* 상태 관리 버튼 섹션 */}
          <div className={styles.actionSection}>
            {order.status === 'PENDING' && (
              <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                입금 확인 완료
              </button>
            )}
            {['PAID', 'REGISTERED', 'PENDING'].includes(order.status) && (
              <button className={`${styles.actionBtn} ${styles.dangerBtn}`}>
                주문 취소하기
              </button>
            )}
            {order.status === 'PAID' && (
              <button className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
                환불 승인
              </button>
            )}
            <button className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
              메모 남기기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
