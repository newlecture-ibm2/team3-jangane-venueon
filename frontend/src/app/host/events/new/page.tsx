'use client';

import { useState } from 'react';
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
    startDate: form.startDate,
    endDate: form.endDate,
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
                    카테고리 ID
                  </label>
                  <input
                    id="categoryId"
                    name="categoryId"
                    type="number"
                    className={styles.fieldInput}
                    placeholder="예) 1"
                    value={form.categoryId}
                    onChange={handleChange}
                  />
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
              <h2 className={styles.sectionTitle}>썸네일</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="thumbnailUrl" className={styles.fieldLabel}>
                  썸네일 이미지 URL
                </label>
                <input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  className={styles.fieldInput}
                  placeholder="https://example.com/image.jpg"
                  value={form.thumbnailUrl}
                  onChange={handleChange}
                />
                <p className={styles.fieldHint}>외부 이미지 URL을 입력해주세요. 비워두면 기본 이미지가 표시됩니다.</p>
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
