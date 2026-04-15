'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import styles from './page.module.css';
import { adminEventAPI, adminCategoryAPI, AdminEventDetail } from '@/lib/admin-api';
import { Tag, Button, InputField } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useUIStore } from '@/store/useUIStore';

import { Sidebar } from '@/components/layout';

// category 타입 정의 (내부용)
interface CategoryOption {
  id: number;
  name: string;
}

export default function AdminEventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    categoryId: 0,
  });
  const [editSessions, setEditSessions] = useState<any[]>([]);
  const [editTickets, setEditTickets] = useState<any[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useUIStore();

  useEffect(() => {
    if (id) {
      fetchDetail();
      fetchCategories();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await adminCategoryAPI.getList();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await adminEventAPI.getEvent(Number(id));
      if (res.success) {
        setEvent(res.data);
        setEditData({
          title: res.data.title,
          description: res.data.description,
          categoryId: res.data.categoryId,
        });
        setEditSessions(res.data.sessions || []);
        setEditTickets(res.data.tickets || []);
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

  const handleUpdate = async () => {
    if (!event) return;
    if (!editData.title.trim()) {
      showToast('제목을 입력해 주세요.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. 기본 정보 수정
      const updateRes = await adminEventAPI.updateEvent(event.id, {
        title: editData.title,
        description: editData.description,
        categoryId: editData.categoryId,
        thumbnailUrl: event.thumbnailUrl
      });

      if (!updateRes.success) {
        showToast(updateRes.message || '강의 정보 저장에 실패했습니다.', 'error');
        return;
      }

      // 2. 세션 정보 순차 수정
      for (const sess of editSessions) {
        await adminEventAPI.updateSession(event.id, sess.id, {
          title: sess.title,
          description: sess.description,
          startTime: sess.startTime,
          endTime: sess.endTime,
          location: sess.location,
          isOnline: sess.isOnline,
          maxAttendees: sess.maxAttendees
        });
      }

      // 3. 티켓 정보 순차 수정
      for (const tkt of editTickets) {
        await adminEventAPI.updateTicket(event.id, tkt.id, {
          name: tkt.name,
          description: tkt.description,
          price: Number(tkt.price),
          originalPrice: Number(tkt.originalPrice || 0),
          maxQuantity: tkt.maxQuantity,
          isActive: tkt.isActive
        });
      }

      showToast('모든 변경사항이 저장되었습니다.', 'success');
      setIsEditing(false);
      fetchDetail();
    } catch (error) {
      console.error('Failed to update event:', error);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
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

  const getStatusInfo = (displayStatus: string) => {
    switch (displayStatus) {
      case 'READY': return { label: '게시 전', variant: 'gray' as const };
      case 'RECRUITING': return { label: '모집 중', variant: 'green' as const };
      case 'CLOSED': return { label: '종료', variant: 'red' as const };
      default: return { label: '알 수 없음', variant: 'gray' as const };
    }
  };

  const statusInfo = getStatusInfo(event.displayStatus);
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
            {isEditing ? (
              <InputField
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="강의 제목을 입력하세요"
                className={styles.titleInput}
              />
            ) : (
              <h1 className={styles.title}>{event.title}</h1>
            )}
            
            <div className={styles.headerActions}>
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                    취소
                  </Button>
                  <Button variant="primary" onClick={handleUpdate} disabled={isSubmitting}>
                    {isSubmitting ? '저장 중...' : '저장하기'}
                  </Button>
                </>
              ) : (
                <Button variant="outlined" onClick={() => setIsEditing(true)}>
                  수정하기
                </Button>
              )}
            </div>
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
            {isEditing ? (
              <textarea
                className={styles.textarea}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="강의 설명을 입력하세요"
              />
            ) : (
              event.description
            )}
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>카테고리</span>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={editData.categoryId}
                  onChange={(e) => setEditData({ ...editData, categoryId: Number(e.target.value) })}
                >
                  <option value={0}>카테고리 선택</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.infoValue}>{event.categoryName}</span>
              )}
            </div>
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
          </div>
        </section>

        {/* 세션 일정 및 장소 관리 섹션 */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>일정 및 장소 관리</h3>
          <table className={styles.manageTable}>
            <thead>
              <tr>
                <th>세션 제목</th>
                <th>시작 시간</th>
                <th>종료 시간</th>
                <th>장소/링크</th>
                <th>정원</th>
              </tr>
            </thead>
            <tbody>
              {editSessions.map((sess, idx) => (
                <tr key={sess.id}>
                  <td>
                    {isEditing ? (
                      <input 
                        className={styles.inlineInput} 
                        value={sess.title} 
                        onChange={(e) => {
                          const newSess = [...editSessions];
                          newSess[idx].title = e.target.value;
                          setEditSessions(newSess);
                        }}
                      />
                    ) : (sess.title)}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="datetime-local"
                        className={styles.inlineInput} 
                        value={sess.startTime.slice(0, 16)} 
                        onChange={(e) => {
                          const newSess = [...editSessions];
                          newSess[idx].startTime = e.target.value;
                          setEditSessions(newSess);
                        }}
                      />
                    ) : (format(new Date(sess.startTime), 'MM-dd HH:mm'))}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="datetime-local"
                        className={styles.inlineInput} 
                        value={sess.endTime.slice(0, 16)} 
                        onChange={(e) => {
                          const newSess = [...editSessions];
                          newSess[idx].endTime = e.target.value;
                          setEditSessions(newSess);
                        }}
                      />
                    ) : (format(new Date(sess.endTime), 'MM-dd HH:mm'))}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        className={styles.inlineInput} 
                        value={sess.location || (sess.isOnline ? '온라인' : '')} 
                        onChange={(e) => {
                          const newSess = [...editSessions];
                          newSess[idx].location = e.target.value;
                          setEditSessions(newSess);
                        }}
                      />
                    ) : (sess.isOnline ? '온라인' : sess.location)}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="number"
                        className={styles.inlineInput} 
                        value={sess.maxAttendees} 
                        onChange={(e) => {
                          const newSess = [...editSessions];
                          newSess[idx].maxAttendees = Number(e.target.value);
                          setEditSessions(newSess);
                        }}
                      />
                    ) : (`${sess.currentAttendees}/${sess.maxAttendees}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 티켓 및 가격 관리 섹션 */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>티켓 및 가격 관리</h3>
          <table className={styles.manageTable}>
            <thead>
              <tr>
                <th>티켓 이름</th>
                <th>정상가</th>
                <th>판매가</th>
                <th>판매 수량</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {editTickets.map((tkt, idx) => (
                <tr key={tkt.id}>
                  <td>
                    {isEditing ? (
                      <input 
                        className={styles.inlineInput} 
                        value={tkt.name} 
                        onChange={(e) => {
                          const newTkt = [...editTickets];
                          newTkt[idx].name = e.target.value;
                          setEditTickets(newTkt);
                        }}
                      />
                    ) : (tkt.name)}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="number"
                        className={styles.inlineInput} 
                        value={tkt.originalPrice} 
                        onChange={(e) => {
                          const newTkt = [...editTickets];
                          newTkt[idx].originalPrice = Number(e.target.value);
                          setEditTickets(newTkt);
                        }}
                      />
                    ) : (`₩${tkt.originalPrice?.toLocaleString()}`)}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="number"
                        className={styles.inlineInput} 
                        value={tkt.price} 
                        onChange={(e) => {
                          const newTkt = [...editTickets];
                          newTkt[idx].price = Number(e.target.value);
                          setEditTickets(newTkt);
                        }}
                      />
                    ) : (<strong style={{ color: 'var(--color-primary)' }}>₩{tkt.price?.toLocaleString()}</strong>)}
                  </td>
                  <td>{tkt.soldCount} / {tkt.maxQuantity || '무제한'}</td>
                  <td>
                    {isEditing ? (
                      <select 
                        className={styles.inlineInput}
                        value={tkt.isActive ? 'true' : 'false'}
                        onChange={(e) => {
                          const newTkt = [...editTickets];
                          newTkt[idx].isActive = e.target.value === 'true';
                          setEditTickets(newTkt);
                        }}
                      >
                        <option value="true">판매 중</option>
                        <option value="false">판매 중지</option>
                      </select>
                    ) : (
                      <Tag variant={tkt.isActive ? 'green' : 'gray'}>{tkt.isActive ? '판매 중' : '중지됨'}</Tag>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
