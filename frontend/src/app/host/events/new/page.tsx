'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

/** 이벤트 유형 목록 — 백엔드 EventType enum과 1:1 대응 */
const EVENT_TYPES = [
  { value: 'SEMINAR', label: '세미나' },
  { value: 'CLASS', label: '클래스' },
  { value: 'MEETUP', label: '밋업' },
  { value: 'CONFERENCE', label: '컨퍼런스' },
];

/** 폼 초기값 */
const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'SEMINAR',
  categoryId: '',
  location: '',
  isOnline: false,
  price: '',
  maxAttendees: '',
  thumbnailUrl: '',
  startDate: '',
  endDate: '',
};

export default function HostEventCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<{ data: { id: number; name: string }[] }>('/categories');
        if (res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  /** 공통 필드 변경 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** 체크박스 핸들러 */
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  /** 폼 유효성 검증 */
  const validate = (): string | null => {
    if (!form.title.trim()) return '강의 제목을 입력해주세요.';
    if (!form.type) return '이벤트 유형을 선택해주세요.';
    if (!form.startDate) return '시작일을 입력해주세요.';
    if (!form.endDate) return '종료일을 입력해주세요.';
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return '종료일은 시작일보다 이후여야 합니다.';
    }
    return null;
  };

  /** 파일 업로드 처리 */
  const uploadThumbnail = async (file: File) => {
    try {
      setSubmitting(true);
      
      /**
       * 2번 방식 적용: 공용 api.ts를 건드리지 않고 브라우저 표준 fetch를 직접 사용합니다.
       * 이렇게 하면 조원분들이 api.ts를 수정하시더라도 충돌이 발생하지 않습니다.
       */
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload?category=events', {
        method: 'POST',
        body: formData,
        // Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary가 포함된 multipart/form-data를 설정합니다.
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const res = await response.json();
      
      // 서버 응답 구조가 success 플래그를 포함하는 경우를 대비
      const filePath = res.data?.filePath;
      if (filePath) {
        setForm((prev) => ({ ...prev, thumbnailUrl: filePath }));
      }
    } catch (err: any) {
      alert(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadThumbnail(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadThumbnail(e.target.files[0]);
    }
  };

  const removeThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnailUrl: '' }));
  };


  /** 서버 전송용 body 조립 */
  const buildRequestBody = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    location: form.location.trim(),
    isOnline: form.isOnline,
    price: form.price ? Number(form.price) : 0,
    maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : 0,
    thumbnailUrl: form.thumbnailUrl.trim() || null,
    startDate: form.startDate ? (form.startDate.includes(':') && form.startDate.split(':').length === 2 ? `${form.startDate}:00` : form.startDate) : null,
    endDate: form.endDate ? (form.endDate.includes(':') && form.endDate.split(':').length === 2 ? `${form.endDate}:00` : form.endDate) : null,
    hasSession: false,
    purchaseType: 'SINGLE',
    sessions: [],
  });


  /** 임시 저장 — 생성 후 목록으로 이동 */
  const handleSaveDraft = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/host/events', buildRequestBody());
      alert('강의가 임시 저장되었습니다.');
      router.push('/host/events');
    } catch (err: any) {
      setError(err.message || '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  /** 즉시 공개 — 생성(DRAFT) 후 상태를 PUBLISHED로 변경 */
  const handlePublish = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // 1) 이벤트 생성(DRAFT)
      const res = await api.post<{ status: string; data: { id: number } }>(
        '/host/events',
        buildRequestBody()
      );
      const createdId = res.data?.id ?? (res as any).id;

      // 2) 바로 PUBLISHED로 상태 변경
      if (createdId) {
        await api.patch(`/host/events/${createdId}/status?status=PUBLISHED`);
      }

      alert('강의가 생성되고 공개되었습니다!');
      router.push('/host/events');
    } catch (err: any) {
      setError(err.message || '공개에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />

      <main className="sidebar">
        <div className={styles.dashboardWrapper}>

          {/* 상단 헤더 */}
          <div className={styles.pageHeader}>
            <p className={styles.breadcrumb}>
              <Link href="/host/events" className={styles.breadcrumbLink}>
                내 강의 목록
              </Link>
              {' > 새 강의 만들기'}
            </p>
            <h1 className={styles.pageTitle}>새 강의 만들기</h1>
          </div>

          {/* 에러 메시지 */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* 폼 영역 */}
          <div className={styles.formContainer}>

            {/* ── 기본 정보 ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="title" className={styles.fieldLabel}>
                  강의 제목<span className={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  className={styles.fieldInput}
                  placeholder="예) AI 마케팅 실무 마스터 클래스"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="description" className={styles.fieldLabel}>
                  강의 설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={styles.fieldTextarea}
                  placeholder="강의에 대한 상세한 설명을 작성해주세요."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="type" className={styles.fieldLabel}>
                    이벤트 유형<span className={styles.required}>*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className={styles.fieldSelect}
                    value={form.type}
                    onChange={handleChange}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="categoryId" className={styles.fieldLabel}>
                    카테고리
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className={styles.fieldSelect}
                    value={form.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">-- 미분류 --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className={styles.fieldHint}>비워두면 미분류로 등록됩니다.</p>
                </div>
              </div>
            </div>

            {/* ── 일정 ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>일정</h2>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="startDate" className={styles.fieldLabel}>
                    시작일<span className={styles.required}>*</span>
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    className={styles.fieldInput}
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="endDate" className={styles.fieldLabel}>
                    종료일<span className={styles.required}>*</span>
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    className={styles.fieldInput}
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ── 장소 및 참가 정보 ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>장소 및 참가 정보</h2>

              <div className={styles.checkboxRow}>
                <input
                  id="isOnline"
                  name="isOnline"
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={form.isOnline}
                  onChange={handleCheckbox}
                />
                <label htmlFor="isOnline" className={styles.checkboxLabel}>
                  온라인으로 진행합니다
                </label>
              </div>

              {!form.isOnline && (
                <div className={styles.fieldGroup}>
                  <label htmlFor="location" className={styles.fieldLabel}>
                    장소
                  </label>
                  <input
                    id="location"
                    name="location"
                    className={styles.fieldInput}
                    placeholder="예) 서울특별시 강남구 테헤란로 152"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="price" className={styles.fieldLabel}>
                    가격 (원)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    className={styles.fieldInput}
                    placeholder="0 (무료)"
                    value={form.price}
                    onChange={handleChange}
                  />
                  <p className={styles.fieldHint}>0원이면 무료 강의로 등록됩니다.</p>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="maxAttendees" className={styles.fieldLabel}>
                    최대 정원 (명)
                  </label>
                  <input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    min="0"
                    className={styles.fieldInput}
                    placeholder="0 (무제한)"
                    value={form.maxAttendees}
                    onChange={handleChange}
                  />
                  <p className={styles.fieldHint}>0이면 인원 제한 없음입니다.</p>
                </div>
              </div>
            </div>

            {/* ── 썸네일 ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>썸네일 이미지</h2>
              
              <div className={styles.fieldGroup}>
                {form.thumbnailUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img 
                      src={`/api/upload/${form.thumbnailUrl}`} 
                      alt="Thumbnail Preview" 
                      className={styles.thumbnailPreview} 
                      onError={(e) => {
                        // 만약 상대경로 라우팅 방식이 다르면 기본 백엔드 주소로 fallback 시도
                        (e.target as HTMLImageElement).src = `http://localhost:8080/upload/${form.thumbnailUrl}`;
                      }}
                    />
                    <button type="button" className={styles.removeThumbnailBtn} onClick={removeThumbnail}>
                      이미지 삭제
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`${styles.fileUploadArea} ${dragActive ? styles.dragActive : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className={styles.uploadText}>클릭하여 이미지를 선택하거나 파일을 끌어다 놓으세요</p>
                    <p className={styles.uploadHint}>JPG, PNG 포맷 지원 (최대 5MB)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className={styles.hiddenInput} 
                      accept="image/jpeg, image/png, image/webp" 
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── 액션 버튼 ── */}
            <div className={styles.actionArea}>
              <Link href="/host/events">
                <button type="button" className={styles.btnCancel}>
                  취소
                </button>
              </Link>
              <button
                type="button"
                className={styles.btnDraft}
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                {submitting ? '저장 중...' : '임시 저장'}
              </button>
              <button
                type="button"
                className={styles.btnSubmit}
                onClick={handlePublish}
                disabled={submitting}
              >
                {submitting ? '처리 중...' : '저장 후 공개하기'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
