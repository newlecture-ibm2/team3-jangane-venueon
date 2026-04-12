'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import styles from './page.module.css';
import { adminEventAPI, AdminEventDetail } from '@/lib/admin-api';
import { Tag, Button } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useUIStore } from '@/store/useUIStore';

import { Sidebar } from '@/components/layout';

export default function AdminEventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);

  const { showToast } = useUIStore();

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await adminEventAPI.getEvent(Number(id));
      if (res.success) {
        setEvent(res.data);
      } else {
        showToast(res.message || '강의 정보를 불러오는 데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch event detail:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibilityClick = () => {
    if (!event) return;
    if (event.isHidden) {
      handleToggleVisibility(); // 노출 전환은 바로 처리
    } else {
      setIsHideModalOpen(true); // 숨김 처리 시에만 모달
    }
  };

  const handleToggleVisibility = async () => {
    if (!event) return;
    try {
      const res = await adminEventAPI.toggleVisibility(event.id);
      if (res.success) {
        // 즉시 상태 갱신
        setEvent({ ...event, isHidden: !event.isHidden });
        showToast('노출 상태가 변경되었습니다.', 'success');
      } else {
        showToast(res.message || '상태 변경에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsHideModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      const res = await adminEventAPI.deleteEvent(event.id);
      if (res.success) {
        showToast('삭제 되었습니다.', 'success');
        router.push('/admin/events');
      } else {
        showToast(res.message || '삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container-sidebar">
        <Sidebar role="admin" />
        <section className="sidebar-content">
          <div className={`${styles.skeleton}`} style={{ width: '120px', height: '32px', marginBottom: '24px' }} />
          <div className={`${styles.skeleton}`} style={{ width: '60px', height: '24px', marginBottom: '16px' }} />
          <div className={`${styles.skeleton}`} style={{ width: '60%', height: '48px', marginBottom: '32px' }} />
          <div className={`${styles.thumbnailWrapper} ${styles.skeleton}`} />
        </section>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container-sidebar">
        <Sidebar role="admin" />
        <section className="sidebar-content">
          <div className={styles.topBar}>
            <Link href="/admin/events" className={styles.backButton}>
              ← 강의 목록 보기
            </Link>
          </div>
          <p>강의를 찾을 수 없습니다.</p>
        </section>
      </div>
    );
  }

  const STATUS_MAP: Record<string, { label: string; variant: 'green' | 'purple' | 'gray' | 'red' }> = {
    PUBLISHED: { label: '모집 중', variant: 'green' },
    ONGOING: { label: '진행 중', variant: 'purple' },
    DRAFT: { label: '심사 중', variant: 'gray' },
    ENDED: { label: '종료', variant: 'gray' },
    CANCELLED: { label: '취소', variant: 'red' },
  };

  const statusInfo = STATUS_MAP[event.status] || { label: event.status, variant: 'gray' };
  const imageUrl = event.thumbnailUrl ? `/upload/${event.thumbnailUrl}` : '';

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />
      <section className="sidebar-content">
        {/* 뒤로 가기 바 */}
        <div className={styles.topBar}>
          <Link href="/admin/events" className={styles.backButton}>
            ← 강의 목록 보기
          </Link>
        </div>

        {/* 헤더 섹션 */}
        <div className={styles.headerSection}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
            {event.isHidden && <Tag variant="red">숨김 처리됨</Tag>}
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{event.title}</h1>
          </div>
        </div>

        {/* 썸네일 */}
        <div className={styles.thumbnailWrapper}>
          {imageUrl ? (
            <img src={imageUrl} alt={event.title} className={styles.thumbnail} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
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
                {event.isOnline ? '온라인 세션' : event.location}
              </span>
            </div>
          </div>
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
              <h4 className={styles.hostName}>{event.host?.orgName || '정보 없음'}</h4>
              <p className={styles.hostDesc}>{event.host?.orgDescription || '주최자 소개가 없습니다.'}</p>
            </div>
          </div>
        </section>

        {/* 하단 액션 버튼 */}
        <div className={styles.bottomActionArea}>
          <Button
            variant="secondary"
            size="large"
            onClick={handleToggleVisibilityClick}
            style={{
              backgroundColor: event.isHidden ? 'var(--color-text-gray-900)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              minWidth: '120px'
            }}
          >
            {event.isHidden ? '숨김 해제' : '숨김 처리'}
          </Button>
          <Button
            variant="danger"
            size="large"
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ minWidth: '120px' }}
          >
            삭제
          </Button>
        </div>

        {/* 삭제 확인 모달 */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="강의 삭제"
          subtitle="정말로 이 강의를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
          status="danger"
          confirmText="삭제"
        />

        {/* 숨김 확인 모달 (CSS 변수 오버라이드로 레이아웃은 유지하되 버튼 색상만 변경) */}
        <div style={{ '--color-error': 'var(--color-primary)' } as React.CSSProperties}>
          <ConfirmModal
            isOpen={isHideModalOpen}
            onClose={() => setIsHideModalOpen(false)}
            onConfirm={handleToggleVisibility}
            title="해당 강의를 목록에서 숨기시겠습니까?"
            subtitle="숨김 처리 시 수강생 페이지에 노출되지 않으며, 언제든지 다시 노출할 수 있습니다."
            status="danger"
            confirmText="숨기기"
          />
        </div>
      </section>
    </div>
  );
}
