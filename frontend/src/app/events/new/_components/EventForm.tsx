"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, InputField, TextareaField, SelectBox } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import styles from './EventForm.module.css';
import { useUIStore } from '@/store/useUIStore';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import HostManagementPanel from '../../[id]/_components/HostManagementPanel';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false });

export interface EventFormProps {
  mode?: 'create' | 'edit';
  eventId?: string;
  initialData?: any;
}

export default function EventForm({ mode = 'create', eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasSession, setHasSession] = useState<boolean>(initialData?.hasSession || false);
  const [purchaseType, setPurchaseType] = useState<'SINGLE' | 'MULTI'>(initialData?.purchaseType || 'SINGLE');
  const [activeTab, setActiveTab] = useState<'general' | 'sessions'>('general');
  const [sessions, setSessions] = useState<any[]>(
    (initialData?.sessions || []).map((s: any) => ({
      ...s,
      // 기존 ISO datetime → 분리된 date + time 필드로 변환
      startDate: s.startTime ? s.startTime.substring(0, 10) : '',
      startTimeOnly: s.startTime ? s.startTime.substring(11, 16) : '10:00',
      endDate: s.endTime ? s.endTime.substring(0, 10) : '',
      endTimeOnly: s.endTime ? s.endTime.substring(11, 16) : '18:00',
      useRecruitPeriod: !!(s.recruitStartDate || s.recruitEndDate),
      recruitStartDate: s.recruitStartDate ? s.recruitStartDate.substring(0, 10) : '',
      recruitEndDate: s.recruitEndDate ? s.recruitEndDate.substring(0, 10) : '',
    }))
  );
  const [tickets, setTickets] = useState<any[]>(
    (initialData?.tickets || []).length > 0
      ? initialData!.tickets.map((t: any) => {
        const hasDiscount = t.originalPrice > 0 && t.price < t.originalPrice;
        return {
          ...t,
          // 할인 있으면: price=정가(originalPrice), discountPrice=할인가(price)
          price: hasDiscount ? t.originalPrice : t.price,
          discountPrice: hasDiscount ? t.price : undefined,
          useDiscount: hasDiscount,
          selectedSessionIndices: t.sessionIds
            ? t.sessionIds.map((sid: number) => (initialData?.sessions || []).findIndex((s: any) => s.id === sid)).filter((i: number) => i !== -1)
            : []
        };
      })
      : [{ name: '기본 티켓', price: 0, originalPrice: 0, useDiscount: false, isAllSessions: true, maxQuantity: '', description: '', selectedSessionIndices: [] }]
  );
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [deletedTicketIds, setDeletedTicketIds] = useState<number[]>([]);
  const [deletedSessionIds, setDeletedSessionIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    categoryId: initialData?.categoryId ? String(initialData.categoryId) : '1',
    title: initialData?.title || '',
    description: initialData?.description || '',
    detailContent: initialData?.detailContent || '',
    price: initialData?.price !== undefined ? initialData.price.toString() : '',
    location: initialData?.location || '',
    isOnlineStr: initialData?.isOnline !== undefined ? String(initialData.isOnline) : '',
    startDate: initialData?.startDate ? initialData.startDate.substring(0, 10) : '',
    startTimeOnly: initialData?.startDate ? initialData.startDate.substring(11, 16) : '10:00',
    endDate: initialData?.endDate ? initialData.endDate.substring(0, 10) : '',
    endTimeOnly: initialData?.endDate ? initialData.endDate.substring(11, 16) : '18:00',
    useRecruitPeriod: initialData?.useRecruitPeriod || false,
    recruitStartDate: initialData?.recruitStartDate ? initialData.recruitStartDate.substring(0, 10) : '',
    recruitEndDate: initialData?.recruitEndDate ? initialData.recruitEndDate.substring(0, 10) : '',
    addressRoad: '',
    addressDetail: '',
    regionSido: '',
    regionSigungu: '',
  });

  React.useEffect(() => {
    setIsMounted(true);
    if (initialData?.thumbnailUrl) {
      setPreviewUrl(`/upload/${initialData.thumbnailUrl}`);
      setThumbnailUrl(initialData.thumbnailUrl);
    }
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const resData = await res.json();
        if (resData.success && resData.data) {
          setCategories(resData.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, [initialData]);

  if (!isMounted) {
    return (
      <div className={styles.formContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: '#888', fontSize: '1rem' }}>로딩 중...</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    // 이미지 파일 유형 검증
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/)) {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }
    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      showToast('파일 크기는 5MB 이하여야 합니다.', 'error');
      return;
    }

    // 미리보기 즉시 표시
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'event-thumbnail');

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('업로드 실패');

      const data = await res.json();
      setThumbnailUrl(data.data.filePath);
      showToast('이미지가 업로드되었습니다.', 'success');
    } catch (err) {
      showToast('이미지 업로드에 실패했습니다.', 'error');
      setPreviewUrl(null);
      setThumbnailUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setThumbnailUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let droppedFile: File | null = null;

    if (e.dataTransfer.items) {
      const item = Array.from(e.dataTransfer.items).find(i => i.kind === 'file');
      if (item) droppedFile = item.getAsFile();
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      droppedFile = e.dataTransfer.files[0];
    }

    if (droppedFile) {
      handleFileUpload(droppedFile);
    } else {
      showToast('파일을 인식할 수 없습니다. (브라우저 지원 문제일 수 있습니다)', 'error');
    }
  };

  const calculatedTotalPrice = 0;

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    try {
      const isOnline = formData.isOnlineStr === 'true';

      // (날짜 계산은 이제 단일/복합 분기 후 페이로드에 합쳐서 발송되므로 이벤트 생성 자체에는 불필요하지만,
      // 과거 하위 호환을 대비해 그대로 더미값으로 진행하거나 제거해도 무방합니다.)

      // API 요청 분기 (create / edit)
      const payload = {
        categoryId: parseInt(formData.categoryId, 10) || 1,
        title: formData.title || '새 이벤트',
        description: formData.description,
        detailContent: formData.detailContent,
        typeId: initialData?.type?.id || 4, // 4 = SEMINAR default
        thumbnailUrl: thumbnailUrl,
        hasSession,
      };

      console.log("[DEBUG] API Request Payload:", JSON.stringify(payload, null, 2));

      let res;
      if (mode === 'create') {
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        let errMsg = `이벤트 ${mode === 'create' ? '생성' : '수정'} 실패`;
        try {
          const errData = await res.json();
          console.error("[DEBUG] API Error Response:", JSON.stringify(errData, null, 2));
          if (errData && errData.message) errMsg += ` - ${errData.message}`;
        } catch (e) {
          console.error("[DEBUG] API Error Response (Not JSON):", res.status, res.statusText);
        }
        throw new Error(errMsg);
      }

      const resData = await res.json();
      const targetId = mode === 'create' ? resData.data.id : eventId;

      // 세션 저장 로직
      const savedSessionIds: number[] = [];
      if (hasSession && sessions.length > 0) {
        for (let i = 0; i < sessions.length; i++) {
          const session = sessions[i];
          // 세션 기간: 날짜+시간을 합쳐서 ISO 형식 생성
          let startTime = null;
          let endTime = null;
          if (session.startDate) {
            startTime = `${session.startDate}T${session.startTimeOnly || '10:00'}:00`;
          }
          if (session.endDate) {
            endTime = `${session.endDate}T${session.endTimeOnly || '18:00'}:00`;
          }

          // 모집 기간
          let recruitStartDate = null;
          let recruitEndDate = null;
          if (session.useRecruitPeriod) {
            if (session.recruitStartDate) {
              recruitStartDate = `${session.recruitStartDate}T00:00:00`;
            }
            if (session.recruitEndDate) {
              recruitEndDate = `${session.recruitEndDate}T23:59:00`;
            }
          }

          const sessionPayload = {
            title: session.title || '새 세션',
            description: session.description || '세션 설명',
            sortOrder: i,
            startTime,
            endTime,
            location: session.useCustomAddress ? session.location : formData.location || '',
            regionSido: session.useCustomAddress ? session.regionSido : formData.regionSido || '서울',
            regionSigungu: session.useCustomAddress ? session.regionSigungu : formData.regionSigungu || '강남구',
            addressRoad: session.useCustomAddress ? session.addressRoad : formData.addressRoad || '',
            addressDetail: session.useCustomAddress ? session.addressDetail : formData.addressDetail || '',
            isOnline: formData.isOnlineStr === 'true',
            onlineLink: session.onlineLink || '',
            maxAttendees: Number(session.maxAttendees) || 0,
            recruitStartDate,
            recruitEndDate,
          };

          if (session.id) {
            const putRes = await fetch(`/api/host/events/${targetId}/sessions/${session.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sessionPayload)
            });
            if (!putRes.ok) {
              console.error(`[DEBUG] Session PUT failed:`, putRes.status, await putRes.text().catch(() => ''));
            }
            savedSessionIds.push(session.id);
          } else {
            const sessRes = await fetch(`/api/host/events/${targetId}/sessions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sessionPayload)
            });
            if (!sessRes.ok) {
              console.error(`[DEBUG] Session POST failed:`, sessRes.status, await sessRes.text().catch(() => ''));
            }
            const sessData = await sessRes.json();
            if (sessData?.data?.id) {
              savedSessionIds.push(sessData.data.id);
            }
          }
        }
      } else {
        // 단일 이벤트인 경우, 백엔드가 자동 생성한 default 세션을 조회해서 날짜/시간 업데이트
        const defaultSessRes = await fetch(`/api/events/${targetId}/sessions`);
        if (defaultSessRes.ok) {
          const dsData = await defaultSessRes.json();
          const defaultSession = dsData.data && dsData.data[0];
          if (defaultSession) {
            let startTime = null;
            let endTime = null;
            if (formData.startDate) startTime = `${formData.startDate}T${formData.startTimeOnly || '10:00'}:00`;
            if (formData.endDate) endTime = `${formData.endDate}T${formData.endTimeOnly || '18:00'}:00`;

            let recruitStartDate = null;
            let recruitEndDate = null;
            if (formData.useRecruitPeriod) {
              if (formData.recruitStartDate) recruitStartDate = `${formData.recruitStartDate}T00:00:00`;
              if (formData.recruitEndDate) recruitEndDate = `${formData.recruitEndDate}T23:59:00`;
            }

            const sessionPayload = {
              title: formData.title,
              description: formData.description,
              sortOrder: 0,
              startTime,
              endTime,
              location: formData.isOnlineStr === 'true' ? '온라인 진행' : formData.location || '',
              regionSido: formData.regionSido || '서울',
              regionSigungu: formData.regionSigungu || '강남구',
              addressRoad: formData.addressRoad || '',
              addressDetail: formData.addressDetail || '',
              isOnline: formData.isOnlineStr === 'true',
              onlineLink: '', // 단일 폼엔 현재 필드가 별도 없음
              maxAttendees: 0,
              recruitStartDate,
              recruitEndDate,
            };

            const putRes = await fetch(`/api/host/events/${targetId}/sessions/${defaultSession.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sessionPayload)
            });
            if (putRes.ok) {
              savedSessionIds.push(defaultSession.id);
            } else {
               console.error(`[DEBUG] Default Session PUT failed:`, putRes.status, await putRes.text().catch(() => ''));
            }
          }
        }
      }

      // 실제 백엔드 연동을 위한 세션 삭제 처리 (DB에 존재하는 세션만)
      for (const deletedId of deletedSessionIds) {
        const dsRes = await fetch(`/api/host/events/${targetId}/sessions/${deletedId}`, { method: 'DELETE' });
        if (!dsRes.ok) {
          const dsErr = await dsRes.json().catch(() => ({}));
          throw new Error(`세션 삭제 실패: ${dsErr.message || "오류가 발생했습니다"}`);
        }
      }

      // 티켓 저장 로직
      // 1) 삭제된 티켓 처리 (DB에 존재하는 티켓만)
      for (const deletedId of deletedTicketIds) {
        const dtRes = await fetch(`/api/host/tickets/${deletedId}`, { method: 'DELETE' });
        if (!dtRes.ok) {
          const dtErr = await dtRes.json().catch(() => ({}));
          throw new Error(`티켓 삭제 실패: ${dtErr.message || "오류가 발생했습니다"}`);
        }
      }

      // 2) 생성/수정
      if (tickets.length > 0) {
        for (let j = 0; j < tickets.length; j++) {
          const t = tickets[j];
          // 유효성 검증
          if (!t.isAllSessions && (!t.selectedSessionIndices || t.selectedSessionIndices.length === 0)) {
            throw new Error(`"${t.name || '새 티켓'}" 티켓에 포함할 세션을 1개 이상 선택해주세요.`);
          }

          // 할인 토글 기반으로 originalPrice / price 결정
          const basePrice = Number(t.price) || 0;
          const finalOriginalPrice = t.useDiscount ? basePrice : basePrice;
          const finalPrice = t.useDiscount ? (Number(t.discountPrice) || basePrice) : basePrice;

          const ticketPayload = {
            name: t.name,
            description: t.description || '',
            originalPrice: finalOriginalPrice,
            price: finalPrice,
            isAllSessions: Boolean(t.isAllSessions),
            maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : null,
            sessionIds: t.isAllSessions
              ? []
              : (t.selectedSessionIndices || []).map((idx: number) => savedSessionIds[idx]).filter((id: any) => id !== undefined),
            sortOrder: j,
            salesStart: t.salesStart || null,
            salesEnd: t.salesEnd || null,
          };

          if (t.id) {
            const ticketPutRes = await fetch(`/api/host/tickets/${t.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...ticketPayload, isActive: t.isActive !== false })
            });
            if (!ticketPutRes.ok) {
              console.error(`[DEBUG] Ticket PUT ${t.id} failed:`, ticketPutRes.status, await ticketPutRes.text().catch(() => ''));
            }
          } else {
            const ticketPostRes = await fetch(`/api/host/events/${targetId}/tickets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ticketPayload)
            });
            if (!ticketPostRes.ok) {
              console.error(`[DEBUG] Ticket POST failed:`, ticketPostRes.status, await ticketPostRes.text().catch(() => ''));
            }
          }
        }
      }

      if (mode === 'create' && !isDraft) {
        // 바로 게시하기 (새로 만들 때만)
        const publishRes = await fetch(`/api/host/events/${targetId}/status?status=2`, {
          method: 'PATCH'
        });
        if (!publishRes.ok) throw new Error('상태 변경 실패');
      }

      showToast(mode === 'create' ? (isDraft ? '임시 저장되었습니다.' : '이벤트가 성공적으로 게시되었습니다.') : '이벤트가 성공적으로 수정되었습니다.', 'success');
      // 서버 컴포넌트 캐시를 우회하기 위해 하드 네비게이션
      window.location.href = `/events/${targetId}`;
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSession = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sessions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // 티켓이 가리키는 인덱스도 같이 스왑해줍니다.
    const newTickets = tickets.map(t => {
      if (t.isAllSessions || !t.selectedSessionIndices) return t;
      const newIndices = t.selectedSessionIndices.map((idx: number) => {
        if (idx === index) return targetIndex;
        if (idx === targetIndex) return index;
        return idx;
      });
      return { ...t, selectedSessionIndices: newIndices };
    });
    setTickets(newTickets);

    const newSessions = [...sessions];
    const temp = newSessions[index];
    newSessions[index] = newSessions[targetIndex];
    newSessions[targetIndex] = temp;
    setSessions(newSessions);
  };

  const handleMoveTicket = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === tickets.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newTickets = [...tickets];
    const temp = newTickets[index];
    newTickets[index] = newTickets[targetIndex];
    newTickets[targetIndex] = temp;
    setTickets(newTickets);
  };

  return (
    <div className={styles.formContainer}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← 이전으로 돌아가기
      </button>

      {mode === 'edit' && initialData && (
        <HostManagementPanel
          eventId={Number(eventId)}
          status={initialData.status}
          sessions={initialData.sessions || []}
        />
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>카테고리</label>
        <select
          name="categoryId"
          className={styles.selectInput}
          value={formData.categoryId}
          onChange={handleChange}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>이벤트 제목</label>
        <input
          type="text"
          name="title"
          className={styles.titleInput}
          placeholder="제목을 입력하세요."
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>이벤트 메인배너(썸네일)</label>
        {previewUrl ? (
          <div className={styles.previewWrapper}>
            <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
            {uploading && <div className={styles.uploadingOverlay}>업로드 중...</div>}
            <button className={styles.removeImageBtn} onClick={handleRemoveImage} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <div
            className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleDrop(e); }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.uploadIcon}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>{isDragOver ? '여기에 놓으세요' : '클릭하거나 파일을 여기로 끌어다 놓으세요'}</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*, .png, .jpg, .jpeg"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>이벤트 정보</label>
          <span className={styles.charCount}>{formData.description.length}/300</span>
        </div>
        <textarea
          name="description"
          className={styles.textarea}
          placeholder="이벤트 정보를 입력하세요."
          maxLength={300}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>상세 정보 (선택사항)</label>
        </div>
        <TiptapEditor 
          content={formData.detailContent} 
          onChange={(html) => setFormData(prev => ({ ...prev, detailContent: html }))} 
          placeholder="이벤트 상세 정보를 자유롭게 입력하세요. (이미지 등록 가능)"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>이벤트 운영 방식</label>
        <div className={styles.methodCardsContainer}>
          <div
            className={`${styles.methodCard} ${!hasSession ? styles.activeMethod : ''}`}
            onClick={() => setHasSession(false)}
          >
            <div className={styles.methodInfo}>
              <span className={styles.methodTitle}>단일 이벤트 (고정 패키지)</span>
              <span className={styles.methodDesc}>지정된 날짜/주제 그대로 참여하는 기본적인 형태의 이벤트입니다.</span>
            </div>
          </div>
          <div
            className={`${styles.methodCard} ${hasSession ? styles.activeMethod : ''}`}
            onClick={() => setHasSession(true)}
          >
            <div className={styles.methodInfo}>
              <span className={styles.methodTitle}>복합 이벤트 (다중 세션)</span>
              <span className={styles.methodDesc}>일정/주제가 나뉘어 있어, 고객이 원하는 세션을 취향껏 고를 수 있습니다.</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {hasSession ? '세션 공통 설정 (기본값)' : '이벤트 상세 설정'}
        </h3>

        <div className={styles.grid2}>

          <div className={styles.formGroup} style={{ visibility: hasSession ? 'visible' : 'hidden', display: hasSession ? 'block' : 'none' }}>
            <label className={styles.label}>{hasSession ? '기본 날짜' : '날짜'}</label>
            <input
              type="date"
              name="date"
              className={styles.dateInput}
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>온라인/오프라인</label>
            <select
              name="isOnlineStr"
              className={styles.selectInput}
              value={formData.isOnlineStr || ''}
              onChange={handleChange}
            >
              <option value="">옵션을 선택하세요.</option>
              <option value="false">오프라인</option>
              <option value="true">온라인</option>
            </select>
          </div>
        </div>

        {!formData.isOnlineStr || formData.isOnlineStr === 'false' ? (
          <div className={styles.formGroup}>
            <label className={styles.label}>{hasSession ? '기본 장소 (오프라인)' : '장소 (오프라인)'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                name="location"
                className={styles.standardInput}
                placeholder="장소명 입력 (예: 코엑스 컨벤션센터)"
                value={formData.location}
                onChange={handleChange}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="addressRoad"
                  value={formData.addressRoad || ''}
                  readOnly
                  placeholder="주소 검색 시 자동 채워집니다."
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    new (window as any).daum.Postcode({
                      oncomplete: (data: any) => {
                        setFormData(prev => ({
                          ...prev,
                          addressRoad: data.address,
                          regionSido: data.sido,
                          regionSigungu: data.sigungu
                        }));
                      }
                    }).open();
                  }}
                  style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  📍 주소 검색
                </button>
              </div>
              <input
                type="text"
                name="addressDetail"
                value={formData.addressDetail || ''}
                placeholder="상세 주소 (3층 세미나실 등)"
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>{hasSession ? '기본 위치' : '장소'}</label>
            <input
              type="text"
              name="location"
              className={styles.standardInput}
              value="온라인 진행"
              disabled
            />
          </div>
        )}

        {/* ── 단일 이벤트 세션 기간 설정 (복합세션과 동일 패턴) ── */}
        {!hasSession && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#333', marginBottom: '0.75rem' }}>📅 이벤트 기간 <span style={{ fontWeight: 'normal', color: '#999', fontSize: '0.75rem' }}>미설정 시 호스트가 수동으로 시작/종료 관리</span></div>
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>시작 날짜</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={styles.dateInput}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>시작 시간</label>
                <input
                  type="time"
                  name="startTimeOnly"
                  value={formData.startTimeOnly}
                  onChange={handleChange}
                  className={styles.dateInput}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>종료 날짜</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={styles.dateInput}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>종료 시간</label>
                <input
                  type="time"
                  name="endTimeOnly"
                  value={formData.endTimeOnly}
                  onChange={handleChange}
                  className={styles.dateInput}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* 단일 모집 기간 섹션 */}
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#333', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📋 모집 기간 세부 설정</span>
              <label className={styles.checkboxLabel} style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                <input
                  type="checkbox"
                  checked={formData.useRecruitPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, useRecruitPeriod: e.target.checked }))}
                />
                모집 기간 별도 설정하기
              </label>
            </div>
            {formData.useRecruitPeriod && (
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(2, 1fr)', background: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>모집 시작일</label>
                  <input
                    type="date"
                    name="recruitStartDate"
                    value={formData.recruitStartDate}
                    onChange={handleChange}
                    className={styles.dateInput}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>모집 마감일</label>
                  <input
                    type="date"
                    name="recruitEndDate"
                    value={formData.recruitEndDate}
                    onChange={handleChange}
                    className={styles.dateInput}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {hasSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>세션 목록</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>이벤트 내에 포함될 세션들을 아래에 추가해주세요. 날짜와 장소를 비워두면 위의 '공통 설정'을 자동으로 따릅니다.</p>

          {sessions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <p style={{ color: '#888', marginBottom: '1rem' }}>등록된 세션이 없습니다.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setSessions([...sessions, { title: '새 세션', maxAttendees: 50, sortOrder: sessions.length, startDate: '', startTimeOnly: '10:00', endDate: '', endTimeOnly: '18:00', location: undefined, addressRoad: '', addressDetail: '', regionSido: '', regionSigungu: '', onlineLink: '', isOnline: false, useRecruitPeriod: false, useCustomAddress: false, recruitStartDate: '', recruitEndDate: '' }])}
                  style={{ padding: '0.5rem 1rem', background: '#2b8a3e', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                >
                  + 오프라인 세션 추가
                </button>
                <button
                  type="button"
                  onClick={() => setSessions([...sessions, { title: '새 세션', maxAttendees: 50, sortOrder: sessions.length, startDate: '', startTimeOnly: '10:00', endDate: '', endTimeOnly: '18:00', location: undefined, onlineLink: '', isOnline: true, useRecruitPeriod: false, recruitStartDate: '', recruitEndDate: '' }])}
                  style={{ padding: '0.5rem 1rem', background: '#1c7ed6', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                >
                  + 온라인 세션 추가
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {sessions.map((session, index) => (
                <div key={index} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', position: 'relative', background: '#fafbfc' }}>
                  {/* 헤더: 세션 번호 + 삭제 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#333' }}>
                      <span style={{ background: session.isOnline ? '#e7f5ff' : '#ebfbee', color: session.isOnline ? '#1c7ed6' : '#2b8a3e', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', marginRight: '0.5rem' }}>
                        {session.isOnline ? '🌐 온라인' : '🏠 오프라인'}
                      </span>
                      세션 {index + 1}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveSession(index, 'up')}
                          style={{ background: 'none', border: '1px solid #ddd', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ⬆️ 위로
                        </button>
                      )}
                      {index < sessions.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveSession(index, 'down')}
                          style={{ background: 'none', border: '1px solid #ddd', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ⬇️ 아래로
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const isSessionUsedInTicket = tickets.some(t => 
                            !t.isAllSessions && t.selectedSessionIndices && t.selectedSessionIndices.includes(index)
                          );

                          if (isSessionUsedInTicket) {
                            alert('티켓에 포함된 세션은 티켓 삭제 후 삭제가능합니다.');
                            return;
                          }

                          const newTickets = tickets.map(t => {
                            if (t.isAllSessions || !t.selectedSessionIndices) return t;
                            return {
                              ...t,
                              selectedSessionIndices: t.selectedSessionIndices.map((idx: number) => idx > index ? idx - 1 : idx)
                            };
                          });
                          setTickets(newTickets);

                          if (sessions[index].id) {
                            setDeletedSessionIds(prev => [...prev, sessions[index].id]);
                          }

                          const newSessions = [...sessions];
                          newSessions.splice(index, 1);
                          setSessions(newSessions);
                        }}
                        style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>

                  {/* 기본 정보: 제목, 정원, 장소 */}
                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.25rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>세션 제목</label>
                      <input
                        type="text"
                        value={session.title || ''}
                        onChange={(e) => {
                          const ns = [...sessions]; ns[index].title = e.target.value; setSessions(ns);
                        }}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>정원 명수</label>
                      <input
                        type="number"
                        value={session.maxAttendees || 0}
                        onChange={(e) => {
                          const ns = [...sessions]; ns[index].maxAttendees = parseInt(e.target.value, 10); setSessions(ns);
                        }}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                        {session.isOnline ? '온라인 접속 링크 ' : '세션 장소 (오프라인)'}
                        <span style={{ fontWeight: 'normal', color: '#666' }}>
                          {session.isOnline ? '(구매 완료 고객에게만 공개됩니다)' : ''}
                        </span>
                      </label>
                      {session.isOnline ? (
                        <input
                          type="text"
                          value={session.onlineLink || ''}
                          placeholder="Zoom 링크 등을 입력해주세요"
                          onChange={(e) => {
                            const ns = [...sessions]; ns[index].onlineLink = e.target.value; setSessions(ns);
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>
                            <input
                              type="checkbox"
                              checked={session.useCustomAddress || false}
                              onChange={(e) => {
                                const ns = [...sessions]; ns[index].useCustomAddress = e.target.checked; setSessions(ns);
                              }}
                            />
                            개별 장소 설정 (체크 해제 시 기본 장소 상속)
                          </label>
                          {session.useCustomAddress ? (
                            <>
                              <input
                                type="text"
                                value={session.location || ''}
                                placeholder="장소명 입력 (예: 코엑스 컨벤션센터)"
                                onChange={(e) => {
                                  const ns = [...sessions]; ns[index].location = e.target.value === '' ? undefined : e.target.value; setSessions(ns);
                                }}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                  type="text"
                                  value={session.addressRoad || ''}
                                  readOnly
                                  placeholder="주소 검색 시 자동 채워집니다."
                                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    new (window as any).daum.Postcode({
                                      oncomplete: (data: any) => {
                                        const ns = [...sessions];
                                        ns[index].addressRoad = data.address;
                                        ns[index].regionSido = data.sido;
                                        ns[index].regionSigungu = data.sigungu;
                                        setSessions(ns);
                                      }
                                    }).open();
                                  }}
                                  style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  📍 주소 검색
                                </button>
                              </div>
                              <input
                                type="text"
                                value={session.addressDetail || ''}
                                placeholder="상세 주소 (호스트 수동 입력: 3층 세미나실 등)"
                                onChange={(e) => {
                                  const ns = [...sessions]; ns[index].addressDetail = e.target.value; setSessions(ns);
                                }}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </>
                          ) : (
                            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px dashed #ced4da', borderRadius: '4px', fontSize: '0.85rem', color: '#6c757d' }}>
                              현재 최상단의 <b>[기본 장소]</b> 설정을 따르고 있습니다.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── 세션 기간 섹션 ── */}
                  <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#333', marginBottom: '0.75rem' }}>📅 세션 기간 <span style={{ fontWeight: 'normal', color: '#999', fontSize: '0.75rem' }}>미설정 시 호스트가 수동으로 시작/종료 관리</span></div>
                    <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>시작 날짜</label>
                        <input
                          type="date"
                          value={session.startDate || ''}
                          onChange={(e) => {
                            const ns = [...sessions]; ns[index].startDate = e.target.value || ''; setSessions(ns);
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>시작 시간</label>
                        <input
                          type="time"
                          value={session.startTimeOnly || '10:00'}
                          onChange={(e) => {
                            const ns = [...sessions]; ns[index].startTimeOnly = e.target.value; setSessions(ns);
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>종료 날짜</label>
                        <input
                          type="date"
                          value={session.endDate || ''}
                          onChange={(e) => {
                            const ns = [...sessions]; ns[index].endDate = e.target.value || ''; setSessions(ns);
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>종료 시간</label>
                        <input
                          type="time"
                          value={session.endTimeOnly || '18:00'}
                          onChange={(e) => {
                            const ns = [...sessions]; ns[index].endTimeOnly = e.target.value; setSessions(ns);
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── 모집 기간 섹션 ── */}
                  <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: '#333' }}>
                        <input
                          type="checkbox"
                          checked={session.useRecruitPeriod || false}
                          onChange={(e) => {
                            const ns = [...sessions]; ns[index].useRecruitPeriod = e.target.checked; setSessions(ns);
                          }}
                        />
                        📋 모집 기간 설정
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>체크 해제 시 게시 즉시 모집이 시작됩니다</span>
                    </div>
                    {session.useRecruitPeriod && (
                      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>모집 시작일</label>
                          <input
                            type="date"
                            value={session.recruitStartDate || ''}
                            onChange={(e) => {
                              const ns = [...sessions]; ns[index].recruitStartDate = e.target.value; setSessions(ns);
                            }}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#555' }}>모집 마감일</label>
                          <input
                            type="date"
                            value={session.recruitEndDate || ''}
                            onChange={(e) => {
                              const ns = [...sessions]; ns[index].recruitEndDate = e.target.value; setSessions(ns);
                            }}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSessions([...sessions, { title: '새 세션', maxAttendees: 50, sortOrder: sessions.length, startDate: '', startTimeOnly: '10:00', endDate: '', endTimeOnly: '18:00', location: undefined, addressRoad: '', addressDetail: '', regionSido: '', regionSigungu: '', onlineLink: '', isOnline: false, useRecruitPeriod: false, useCustomAddress: false, recruitStartDate: '', recruitEndDate: '' }])}
                  style={{ flex: 1, padding: '1rem', background: '#ebfbee', color: '#2b8a3e', borderRadius: '8px', border: '1px dashed #2b8a3e', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + 오프라인 세션 추가
                </button>
                <button
                  type="button"
                  onClick={() => setSessions([...sessions, { title: '새 세션', maxAttendees: 50, sortOrder: sessions.length, startDate: '', startTimeOnly: '10:00', endDate: '', endTimeOnly: '18:00', location: undefined, onlineLink: '', isOnline: true, useRecruitPeriod: false, recruitStartDate: '', recruitEndDate: '' }])}
                  style={{ flex: 1, padding: '1rem', background: '#e7f5ff', color: '#1c7ed6', borderRadius: '8px', border: '1px dashed #1c7ed6', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + 온라인 세션 추가
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🔴 티켓 설정 섹션 추가 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>티켓 설정</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>고객이 구매할 티켓 종류와 구매 방식을 설정합니다.</p>

        <div className={styles.formGroup} style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
          <label className={styles.label} style={{ fontSize: '1rem' }}>결제 진행 방식 (티켓 구매 옵션)</label>
          <div className={styles.methodCardsContainer}>
            <div
              className={`${styles.methodCard} ${purchaseType === 'SINGLE' ? styles.activeMethod : ''}`}
              onClick={() => setPurchaseType('SINGLE')}
            >
              <div className={styles.methodInfo}>
                <span className={styles.methodTitle}>단일 결제</span>
                <span className={styles.methodDesc}>티켓 1장만 선택하여 구매 가능</span>
              </div>
            </div>
            <div
              className={`${styles.methodCard} ${purchaseType === 'MULTI' ? styles.activeMethod : ''}`}
              onClick={() => setPurchaseType('MULTI')}
            >
              <div className={styles.methodInfo}>
                <span className={styles.methodTitle}>복수 결제</span>
                <span className={styles.methodDesc}>티켓 여러 장 복수 구매 가능</span>
              </div>
            </div>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
            <p style={{ color: '#888', marginBottom: '1rem' }}>등록된 티켓이 없습니다.</p>
            <button
              type="button"
              onClick={() => setTickets([...tickets, { name: '새 티켓', price: 0, originalPrice: 0, useDiscount: false, isAllSessions: true, maxQuantity: '', description: '', selectedSessionIndices: [] }])}
              style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              + 티켓 추가하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.map((ticket, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', position: 'relative', background: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#333' }}>
                    티켓 {index + 1}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveTicket(index, 'up')}
                        style={{ background: 'none', border: '1px solid #ddd', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ⬆️ 위로
                      </button>
                    )}
                    {index < tickets.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveTicket(index, 'down')}
                        style={{ background: 'none', border: '1px solid #ddd', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ⬇️ 아래로
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const removed = tickets[index];
                        if (removed.id) {
                          setDeletedTicketIds(prev => [...prev, removed.id]);
                        }
                        const newTickets = [...tickets];
                        newTickets.splice(index, 1);
                        setTickets(newTickets);
                      }}
                      style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>티켓 이름</label>
                    <input
                      type="text"
                      value={ticket.name || ''}
                      onChange={(e) => {
                        const newTickets = [...tickets];
                        newTickets[index].name = e.target.value;
                        setTickets(newTickets);
                      }}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>가격 (원)</label>
                    <input
                      type="number"
                      min="0"
                      value={ticket.price === 0 ? '' : ticket.price}
                      onChange={(e) => {
                        const newTickets = [...tickets];
                        newTickets[index].price = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0;
                        setTickets(newTickets);
                      }}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={ticket.useDiscount || false}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].useDiscount = e.target.checked;
                          if (!e.target.checked) {
                            newTickets[index].discountPrice = undefined;
                          }
                          setTickets(newTickets);
                        }}
                      />
                      할인 적용
                    </label>
                    {ticket.useDiscount && (
                      <div>
                        <input
                          type="number"
                          min="0"
                          max={ticket.price || 0}
                          placeholder="할인가 입력"
                          value={ticket.discountPrice ?? ''}
                          onChange={(e) => {
                            const newTickets = [...tickets];
                            const val = parseInt(e.target.value, 10);
                            newTickets[index].discountPrice = isNaN(val) ? '' : val;
                            setTickets(newTickets);
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        {ticket.price > 0 && ticket.discountPrice !== undefined && ticket.discountPrice !== '' && (
                          <p style={{ fontSize: '0.75rem', color: '#1890ff', marginTop: '0.25rem' }}>
                            → {Math.round((1 - (ticket.discountPrice / ticket.price)) * 100)}% 할인 (₩{(ticket.discountPrice || 0).toLocaleString()})
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>수량 제한 <span style={{ fontWeight: 'normal', color: '#666' }}>(비우면 무제한)</span></label>
                    <input
                      type="number"
                      min="0"
                      value={ticket.maxQuantity || ''}
                      onChange={(e) => {
                        const newTickets = [...tickets];
                        newTickets[index].maxQuantity = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                        setTickets(newTickets);
                      }}
                      placeholder="무제한"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>적용 대상</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" checked={ticket.isAllSessions !== false} onChange={() => {
                          const newTickets = [...tickets];
                          newTickets[index].isAllSessions = true;
                          setTickets(newTickets);
                        }} />
                        전체 이벤트 (패키지)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" checked={ticket.isAllSessions === false} onChange={() => {
                          const newTickets = [...tickets];
                          newTickets[index].isAllSessions = false;
                          if (!newTickets[index].selectedSessionIndices) newTickets[index].selectedSessionIndices = [];
                          setTickets(newTickets);
                        }} />
                        개별 세션
                      </label>
                    </div>
                  </div>

                  {ticket.isAllSessions === false && hasSession && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>포함할 세션 선택</label>
                      {sessions.length === 0 && (
                        <p style={{ color: '#ff4d4f', fontSize: '0.8rem', margin: 0 }}>⚠️ 위에서 먼저 세션을 추가해주세요.</p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sessions.map((s, sIndex) => (
                          <label key={sIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                              type="checkbox"
                              checked={(ticket.selectedSessionIndices || []).includes(sIndex)}
                              onChange={(e) => {
                                const newTickets = [...tickets];
                                const current = newTickets[index].selectedSessionIndices || [];
                                if (e.target.checked) {
                                  newTickets[index].selectedSessionIndices = [...current, sIndex];
                                } else {
                                  newTickets[index].selectedSessionIndices = current.filter((i: number) => i !== sIndex);
                                }
                                setTickets(newTickets);
                              }}
                            />
                            {s.title || `세션 ${sIndex + 1}`} {s.date ? `(${s.date})` : ''} - 정원 {s.maxAttendees || 50}명
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTickets([...tickets, { name: '새 티켓', price: 0, originalPrice: 0, useDiscount: false, isAllSessions: true, maxQuantity: '', description: '', selectedSessionIndices: [] }])}
              style={{ padding: '1rem', background: '#f5f5f5', color: '#333', borderRadius: '8px', border: '1px dashed #ccc', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
            >
              + 티켓 항목 추가
            </button>
          </div>
        )}
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.hostSection}>
          <h3 className={styles.hostTitle}>주최자 정보</h3>
          <div className={styles.hostCard}>
            <div className={styles.hostLogo}></div>
            <div className={styles.hostInfo}>
              <h4 className={styles.hostName}>데이터마인드 크리에이티브</h4>
              <p className={styles.hostDesc}>
                데이터를 넘어 마케팅의 본질을 꿰뚫는 AI 전략 그룹으로 실무 마케터들의 AI 전환(AI Transformation) 가속화 및 실질적 생산성 도구 보급합니다.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actionButtonsContainer}>
          <div className={styles.actionButtonsRow}>
            <button
              className={styles.draftBtn}
              disabled={true}
              title="마이페이지 기능이 추가되면 지원될 예정입니다."
            >
              임시 저장
            </button>
            <button
              className={styles.publishBtn}
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              {loading ? (mode === 'create' ? '게시 중...' : '수정 중...') : (mode === 'create' ? '게시하기' : '수정하기')}
            </button>
          </div>
          <button
            className={styles.cancelBtn}
            onClick={() => setIsExitModalOpen(true)}
            disabled={loading}
          >
            나가기
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          setIsExitModalOpen(false);
          router.back();
        }}
        title="세션 작성을 중단하시겠습니까?"
        subtitle="지금 나가면 입력한 정보가 저장되지 않고 모두 삭제됩니다. 작성을 취소하시겠습니까?"
        status="danger"
        cancelText="계속 작성하기"
        confirmText="삭제"
      />
    </div>
  );
}
