'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from '../../new/page.module.css';

/** 이벤트 유형 목록 */
const EVENT_TYPES = [
  { value: 'SEMINAR', label: '세미나' },
  { value: 'CLASS', label: '클래스' },
  { value: 'MEETUP', label: '밋업' },
  { value: 'CONFERENCE', label: '컨퍼런스' },
];

export default function HostEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();

  const [form, setForm] = useState({
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
    status: '', // 추가
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. 카테고리 목록 조회
        const catRes = await api.get<{ data: { id: number; name: string }[] }>('/categories');
        if (catRes.data) setCategories(catRes.data);

        // 2. 기존 이벤트 데이터 조회
        const eventRes = await api.get<any>(`/host/events/${eventId}`);
        const data = eventRes.data || eventRes;

        // 날짜 데이터 변환 (YYYY-MM-DDTHH:mm:SS -> YYYY-MM-DDTHH:mm)
        const formatDateTime = (dateStr: string) => {
          if (!dateStr) return '';
          return dateStr.substring(0, 16);
        };

        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'SEMINAR',
          categoryId: data.categoryId ? String(data.categoryId) : '',
          location: data.location || '',
          isOnline: data.isOnline || false,
          price: String(data.price || 0),
          maxAttendees: String(data.maxAttendees || 0),
          thumbnailUrl: data.thumbnailUrl || '',
          startDate: formatDateTime(data.startDate),
          endDate: formatDateTime(data.endDate),
          status: data.status, // 상태 정보 추가
        });
      } catch (err: any) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return '강의 제목을 입력해주세요.';
    if (!form.startDate) return '시작일을 입력해주세요.';
    if (!form.endDate) return '종료일을 입력해주세요.';
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return '종료일은 시작일보다 이후여야 합니다.';
    }
    return null;
  };

  const buildRequestBody = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    location: form.location.trim(),
    isOnline: form.isOnline,
    price: Number(form.price) || 0,
    maxAttendees: Number(form.maxAttendees) || 0,
    thumbnailUrl: form.thumbnailUrl.trim() || null,
    startDate: form.startDate.length === 16 ? `${form.startDate}:00` : form.startDate,
    endDate: form.endDate.length === 16 ? `${form.endDate}:00` : form.endDate,
    hasSession: false,
    purchaseType: 'SINGLE',
  });

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/host/events/${eventId}`, buildRequestBody());
      alert('수정이 완료되었습니다.');
      router.push(`/host/events/${eventId}`);
    } catch (err: any) {
      setError(err.message || '수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /** 파일 업로드 처리 (new/page.tsx 로직 복사) */
  const uploadThumbnail = async (file: File) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/files/upload?category=events', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('이미지 업로드 실패');
      const res = await response.json();
      const filePath = res.data?.filePath;
      if (filePath) setForm((prev) => ({ ...prev, thumbnailUrl: filePath }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container-sidebar"><Sidebar role="host" /><main className="sidebar">로딩 중...</main></div>;

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <main className="sidebar">
        <div className={styles.dashboardWrapper}>
          <div className={styles.pageHeader}>
            <p className={styles.breadcrumb}>
              <Link href="/host/events" className={styles.breadcrumbLink}>내 강의 목록</Link>
              {' > '}
              <Link href={`/host/events/${eventId}`} className={styles.breadcrumbLink}>강의 상세</Link>
              {' > 강의 수정'}
            </p>
            <h1 className={styles.pageTitle}>강의 수정하기</h1>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formContainer}>
            {/* 기본 정보 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>강의 제목<span className={styles.required}>*</span></label>
                <input name="title" className={styles.fieldInput} value={form.title} onChange={handleChange} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>강의 설명</label>
                <textarea name="description" className={styles.fieldTextarea} value={form.description} onChange={handleChange} />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>이벤트 유형</label>
                  <select name="type" className={styles.fieldSelect} value={form.type} onChange={handleChange}>
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>카테고리</label>
                  <select name="categoryId" className={styles.fieldSelect} value={form.categoryId} onChange={handleChange}>
                    <option value="">-- 미분류 --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 일정 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>일정</h2>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>시작일</label>
                  <input name="startDate" type="datetime-local" className={styles.fieldInput} value={form.startDate} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>종료일</label>
                  <input name="endDate" type="datetime-local" className={styles.fieldInput} value={form.endDate} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* 장소 및 참가 정보 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>장소 및 참가 정보</h2>
              <div className={styles.checkboxRow}>
                <input id="isOnline" name="isOnline" type="checkbox" className={styles.checkboxInput} checked={form.isOnline} onChange={handleCheckbox} />
                <label htmlFor="isOnline" className={styles.checkboxLabel}>온라인으로 진행합니다</label>
              </div>
              {!form.isOnline && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>장소</label>
                  <input name="location" className={styles.fieldInput} value={form.location} onChange={handleChange} />
                </div>
              )}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>가격 (원)</label>
                  <input name="price" type="number" className={styles.fieldInput} value={form.price} onChange={handleChange} disabled={form.status !== 'DRAFT'} />
                  {form.status !== 'DRAFT' && <p className={styles.fieldHint} style={{ color: '#ef4444' }}>모집 중이거나 종료된 강의는 가격을 수정할 수 없습니다.</p>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 정원 (명)</label>
                  <input name="maxAttendees" type="number" className={styles.fieldInput} value={form.maxAttendees} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* 썸네일 */}
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
                        (e.target as HTMLImageElement).src = `http://localhost:8080/upload/${form.thumbnailUrl}`;
                      }}
                    />
                    <button type="button" className={styles.removeThumbnailBtn} onClick={() => setForm(prev => ({ ...prev, thumbnailUrl: '' }))}>
                      이미지 삭제
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`${styles.fileUploadArea} ${dragActive ? styles.dragActive : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files?.[0]) await uploadThumbnail(e.dataTransfer.files[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <p className={styles.uploadText}>클릭하여 이미지를 선택하거나 파일을 끌어다 놓으세요</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className={styles.hiddenInput} 
                      accept="image/*" 
                      onChange={async (e) => {
                        if (e.target.files?.[0]) await uploadThumbnail(e.target.files[0]);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actionArea}>
              <button type="button" className={styles.btnCancel} onClick={() => router.back()}>취소</button>
              <button type="button" className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
                {submitting ? '저장 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
