'use client';

import React, { useState } from 'react';
import styles from './ReviewModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { CancelIcon, ReviewStarIcon } from '@/components/icons';
import { TextareaField, Button, UploadField } from '@/components/ui';

const RATING_LABELS = ['', '별로예요', '그저 그래요', '보통이에요', '좋았어요', '최고예요!'];

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle?: string;
  onSubmitSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSubmitSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const activeRating = hoverRating || rating;

  /* ── 제출 ── */
  const handleSubmit = async () => {
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
      if (imageFile) {
        formData.append('images', imageFile);
      }

      const res = await fetch(`/api/events/${eventId}/reviews`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 초기화
        setRating(0);
        setContent('');
        setImageFile(null);
        setError('');
        onSubmitSuccess?.();
        onClose();
      } else {
        setError(data.message || '리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setError('리뷰 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 모달 닫기 시 초기화 ── */
  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setContent('');
    setImageFile(null);
    setError('');
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <ModalCard size="md">

        {/* 헤더 */}
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>리뷰 작성</h2>
          </div>
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }} onClick={handleClose} />
        </div>

        {/* 별점 */}
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
                <ReviewStarIcon
                  className={`${styles.starIcon} ${star <= activeRating ? styles.starFilled : styles.starEmpty}`}
                  fill={star <= activeRating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <span className={styles.ratingLabel}>
            {RATING_LABELS[activeRating] || '별점을 선택해주세요'}
          </span>
        </div>

        {/* 리뷰 내용 */}
        <TextareaField
          label="리뷰 내용"
          placeholder="수강 경험을 자유롭게 작성해주세요. (최소 10자)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={1000}
          showCount
        />

        {/* 사진 첨부 */}
        <UploadField
          label="사진 첨부"
          accept="image/*"
          onFileSelect={(file) => setImageFile(file)}
        />

        {/* 에러 */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* 하단 버튼 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" style={{ flex: 1, padding: 0 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '리뷰 등록'}
          </Button>
        </div>

      </ModalCard>
    </ModalOverlay>
  );
}
