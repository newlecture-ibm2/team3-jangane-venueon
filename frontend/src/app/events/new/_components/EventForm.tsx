"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, InputField, TextareaField, SelectBox } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import styles from './EventForm.module.css';
import { useUIStore } from '@/store/useUIStore';
import Image from 'next/image';

export interface EventFormProps {
  mode?: 'create' | 'edit';
  eventId?: string;
  initialData?: any;
}

export default function EventForm({ mode = 'create', eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const { showToast } = useUIStore();
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
  const [sessions, setSessions] = useState<any[]>(initialData?.sessions || []);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price !== undefined ? initialData.price.toString() : '',
    date: initialData?.startDate ? initialData.startDate.substring(0, 10) : '',
    isOnlineStr: initialData?.isOnline !== undefined ? String(initialData.isOnline) : '',
    location: initialData?.location || '',
  });

  React.useEffect(() => {
    if (initialData?.thumbnailUrl) {
      setPreviewUrl(`/upload/${initialData.thumbnailUrl}`);
      setThumbnailUrl(initialData.thumbnailUrl);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    // 이미지 파일 유형 검증
    if (!file.type.startsWith('image/')) {
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

  const calculatedTotalPrice = hasSession
    ? sessions.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
    : Number(formData.price) || 0;

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    try {
      const isOnline = formData.isOnlineStr === 'true';

      // 날짜 파싱 (임시로 시작일 10시, 종료일 18시 셋팅)
      let startDateStr = new Date().toISOString();
      let endDateStr = new Date().toISOString();
      if (formData.date) {
        startDateStr = `${formData.date}T10:00:00`;
        endDateStr = `${formData.date}T18:00:00`;
      }

      // API 요청 분기 (create / edit)
      const payload = {
        categoryId: 1, // 테스트용 하드코딩
        title: formData.title || '새 세션',
        description: formData.description,
        type: 'SEMINAR',
        location: formData.location,
        isOnline: isOnline,
        price: calculatedTotalPrice,
        maxAttendees: initialData?.maxAttendees || 50,
        thumbnailUrl: thumbnailUrl,
        startDate: startDateStr,
        endDate: endDateStr,
        hasSession,
        purchaseType,
        sessions: hasSession ? sessions.map(s => ({
          ...s,
          price: Number(s.price) || 0,
          maxAttendees: Number(s.maxAttendees) || 50,
          startTime: s.date ? `${s.date}T10:00:00` : startDateStr,
          endTime: s.date ? `${s.date}T18:00:00` : endDateStr,
          location: s.location || formData.location,
          isOnline: s.isOnline !== undefined ? s.isOnline : isOnline,
          description: s.description || '',
          onlineLink: s.onlineLink || '',
        })) : undefined,
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

      if (mode === 'create' && !isDraft) {
        // 바로 게시하기 (새로 만들 때만)
        const publishRes = await fetch(`/api/events/${targetId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PUBLISHED' })
        });
        if (!publishRes.ok) throw new Error('상태 변경 실패');
      }

      showToast(mode === 'create' ? (isDraft ? '임시 저장되었습니다.' : '세션가 성공적으로 게시되었습니다.') : '세션가 성공적으로 수정되었습니다.', 'success');
      router.push(`/events/${targetId}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← 세션 목록 보기
      </button>

      <div className={styles.formGroup}>
        <label className={styles.label}>세션 제목</label>
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
        <label className={styles.label}>세션 이미지</label>
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
          accept="image/*"
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
          <label className={styles.label}>세션 정보</label>
          <span className={styles.charCount}>{formData.description.length}/300</span>
        </div>
        <textarea
          name="description"
          className={styles.textarea}
          placeholder="세션 정보를 입력하세요."
          maxLength={300}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>세션을 사용하시겠습니까?</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="hasSession" checked={!hasSession} onChange={() => setHasSession(false)} />
            사용안함 (이벤트 전체 판매)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="hasSession" checked={hasSession} onChange={() => setHasSession(true)} />
            사용 (세션별 개별 판매)
          </label>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {hasSession ? '세션 공통 설정 (기본값)' : '이벤트 상세 설정'}
        </h3>

        <div className={styles.grid3}>
          <div className={styles.formGroup}>
            <label className={styles.label}>총 가격</label>
            <div className={styles.priceInputWrapper}>
              <span className={styles.currencyIcon}>₩</span>
              <input
                type="number"
                name="price"
                className={styles.priceInput}
                value={hasSession ? calculatedTotalPrice : formData.price}
                onChange={handleChange}
                disabled={hasSession}
              />
            </div>
            {hasSession && <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', display: 'block' }}>세션 설정에서 추가한 금액의 합계입니다.</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{hasSession ? '기본 날짜' : '날짜'}</label>
            <input
              type="date"
              name="date"
              className={styles.dateInput}
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>온라인/오프라인</label>
            <select
              name="isOnlineStr"
              className={styles.selectInput}
              value={formData.isOnlineStr}
              onChange={handleChange}
            >
              <option value="">옵션을 선택하세요.</option>
              <option value="false">오프라인</option>
              <option value="true">온라인</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{hasSession ? '기본 장소' : '장소'}</label>
          <input
            type="text"
            name="location"
            className={styles.standardInput}
            placeholder="오프라인 강의일 경우 주소를 입력해주세요."
            value={formData.location}
            onChange={handleChange}
            disabled={formData.isOnlineStr === 'true'}
          />
        </div>

        {hasSession && (
          <div className={styles.formGroup}>
            <label className={styles.label}>세션 구매 방식</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="purchaseType" checked={purchaseType === 'SINGLE'} onChange={() => setPurchaseType('SINGLE')} />
                단일 선택 (고객이 1개의 세션만 선택 가능)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="purchaseType" checked={purchaseType === 'MULTI'} onChange={() => setPurchaseType('MULTI')} />
                복수 선택 (고객이 여러 세션을 동시 구매 가능)
              </label>
            </div>
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
              <button
                type="button"
                onClick={() => setSessions([...sessions, { title: '새 세션', price: 0, maxAttendees: 50, sortOrder: sessions.length, date: undefined, location: undefined }])}
                style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                + 세션 추가하기
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map((session, index) => (
                <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newSessions = [...sessions];
                      newSessions.splice(index, 1);
                      setSessions(newSessions);
                    }}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                  >
                    🗑️ 삭제
                  </button>
                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>세션 제목</label>
                      <input
                        type="text"
                        value={session.title || ''}
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].title = e.target.value;
                          setSessions(newSessions);
                        }}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>가격</label>
                      <input
                        type="number"
                        value={session.price || 0}
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].price = parseInt(e.target.value, 10);
                          setSessions(newSessions);
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
                          const newSessions = [...sessions];
                          newSessions[index].maxAttendees = parseInt(e.target.value, 10);
                          setSessions(newSessions);
                        }}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>세션 날짜 <span style={{ fontWeight: 'normal', color: '#666' }}>(비울시 일반설정 동기화)</span></label>
                      <input
                        type="date"
                        value={session.date !== undefined ? session.date : formData.date}
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].date = e.target.value === "" ? undefined : e.target.value;
                          setSessions(newSessions);
                        }}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>세션 장소 <span style={{ fontWeight: 'normal', color: '#666' }}>(비울시 일반설정 동기화)</span></label>
                      <input
                        type="text"
                        value={session.location !== undefined ? session.location : formData.location}
                        placeholder="일반 설정과 다른 경우 입력"
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].location = e.target.value === "" ? undefined : e.target.value;
                          setSessions(newSessions);
                        }}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSessions([...sessions, { title: '새 세션', price: 0, maxAttendees: 50, sortOrder: sessions.length, date: undefined, location: undefined }])}
                style={{ padding: '1rem', background: '#f5f5f5', color: '#333', borderRadius: '8px', border: '1px dashed #ccc', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
              >
                + 세션 항목 추가
              </button>
            </div>
          )}
        </div>
      )}

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
