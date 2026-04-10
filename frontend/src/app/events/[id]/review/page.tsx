'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Button, TextareaField } from '@/components/ui';

/* ── 타입 ── */
interface EventSummary {
  id: number;
  title: string;
  thumbnailUrl: string;
  startDate: string;
  location: string;
  isOnline: boolean;
}

const RATING_LABELS = ['', '별로예요', '그저 그래요', '보통이에요', '좋았어요', '최고예요!'];
const MAX_IMAGES = 5;

/* ── 별 아이콘 SVG ── */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`${styles.starIcon} ${filled ? styles.starFilled : styles.starEmpty}`}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/* ── 메인 컴포넌트 ── */
export default function ReviewWritePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 상태 */
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  /* 리뷰 폼 상태 */
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  /* ── 이벤트 정보 로드 ── */
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.data);
        } else {
          setError('이벤트 정보를 불러오지 못했습니다.');
        }
      } catch {
        setError('이벤트 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  /* ── 이미지 추가 핸들러 ── */
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, remaining);

    const newImages = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // 같은 파일 다시 선택 허용
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── 이미지 삭제 핸들러 ── */
  const handleImageRemove = (index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  /* ── 제출 핸들러 ── */
  const handleSubmit = async () => {
    // 유효성 검사
    if (rating === 0) {
      setError('별점을 선택해주세요.');
      return;
    }
    if (content.trim().length < 10) {
      setError('리뷰 내용은 최소 10자 이상 입력해주세요.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('content', content);
      images.forEach(({ file }) => {
        formData.append('images', file);
      });

      const res = await fetch(`/api/events/${eventId}/reviews`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || '리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setError('리뷰 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 로딩 ── */
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>불러오는 중...</div>
      </div>
    );
  }

  /* ── 제출 완료 ── */
  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <span className={styles.successIcon}>🎉</span>
          <h2 className={styles.successTitle}>리뷰가 등록되었습니다!</h2>
          <p className={styles.successDescription}>
            소중한 후기를 남겨주셔서 감사합니다.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
            <Link href={`/events/${eventId}`} style={{ textDecoration: 'none' }}>
              <Button variant="outlined" size="large">세션 상세로 돌아가기</Button>
            </Link>
            <Link href="/mypage" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="large">마이페이지</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── 리뷰 작성 폼 ── */
  const activeRating = hoverRating || rating;

  return (
    <div className={styles.container}>

      {/* 뒤로 가기 */}
      <div className={styles.topBar}>
        <Link href={`/events/${eventId}`} className={styles.backButton}>
          ← 세션 상세로 돌아가기
        </Link>
      </div>

      {/* 이벤트 요약 정보 */}
      {event && (
        <div className={styles.eventSummary}>
          {event.thumbnailUrl ? (
            <img
              src={`/upload/${event.thumbnailUrl}`}
              alt={event.title}
              className={styles.eventThumbnail}
            />
          ) : (
            <div className={styles.eventThumbnail} />
          )}
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            <p className={styles.eventMeta}>
              {event.isOnline ? '온라인' : event.location}
            </p>
          </div>
        </div>
      )}

      {/* 별점 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>수강은 어떠셨나요?</h2>
        <p className={styles.sectionDescription}>
          별점과 함께 후기를 남겨주세요. 다른 수강생에게 큰 도움이 됩니다.
        </p>

        <div className={styles.ratingWrapper}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={styles.starButton}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star}점`}
              >
                <StarIcon filled={star <= activeRating} />
              </button>
            ))}
          </div>
          <span className={styles.ratingLabel}>
            {RATING_LABELS[activeRating] || '별점을 선택해주세요'}
          </span>
        </div>
      </section>

      {/* 리뷰 내용 섹션 */}
      <section className={styles.section}>
        <TextareaField
          label="리뷰 내용"
          placeholder="수강 경험을 자유롭게 작성해주세요. (최소 10자)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={1000}
          showCount
        />
      </section>

      {/* 이미지 첨부 섹션 */}
      <section className={styles.section}>
        <div className={styles.imageUploadArea}>
          <span className={styles.imageUploadLabel}>
            사진 첨부 (최대 {MAX_IMAGES}장)
          </span>
          <div className={styles.imagePreviewList}>
            {images.map((img, idx) => (
              <div key={idx} className={styles.imagePreviewItem}>
                <img src={img.preview} alt={`첨부 이미지 ${idx + 1}`} />
                <button
                  type="button"
                  className={styles.imageRemoveButton}
                  onClick={() => handleImageRemove(idx)}
                  aria-label="이미지 삭제"
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                className={styles.imageAddButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={{ fontSize: '24px', lineHeight: 1 }}>+</span>
                <span>사진 추가</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.imageHiddenInput}
            onChange={handleImageAdd}
          />
        </div>
      </section>

      {/* 에러 메시지 */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* 하단 버튼 영역 */}
      <div className={styles.bottomActionArea}>
        <Link href={`/events/${eventId}`} style={{ textDecoration: 'none' }}>
          <Button variant="outlined" size="large">취소</Button>
        </Link>
        <Button
          variant="primary"
          size="large"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '등록 중...' : '리뷰 등록'}
        </Button>
      </div>

    </div>
  );
}
