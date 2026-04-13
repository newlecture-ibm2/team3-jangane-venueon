'use client';

import React, { useState } from 'react';
import styles from './ReportModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { CancelIcon } from '@/components/icons';
import { Tabs, TextareaField, Button } from '@/components/ui';

const REPORT_REASONS = [
  { value: 'SPAM', label: '영리목적/홍보성' },
  { value: 'ABUSE', label: '욕설/비하발언' },
  { value: 'FLOODING', label: '도배' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠' },
  { value: 'ETC', label: '기타' },
];

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'POST' | 'COMMENT';
  targetId: number;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [activeReason, setActiveReason] = useState(REPORT_REASONS[0].value);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const title = targetType === 'POST' ? '게시물 신고' : '댓글 신고';
  const subtitle = targetType === 'POST' 
    ? '부적절한 게시물은 관리자 검토 후 조치됩니다.' 
    : '부적절한 댓글은 관리자 검토 후 조치됩니다.';

  const handleClose = () => {
    setActiveReason(REPORT_REASONS[0].value);
    setDetail('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: activeReason,
          detail: detail.trim() || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Report failed:', errorData);
        throw new Error(errorData.message || '신고 등록에 실패했습니다.');
      }

      alert('신고가 접수되었습니다.');
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '신고 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <ModalCard size="md">
        {/* 헤더 */}
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <CancelIcon
            style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }}
            onClick={handleClose}
          />
        </div>

        {/* 신고 사유 선택 */}
        <div className={styles.fieldWrapper}>
          <span className={styles.fieldLabel}>신고 사유</span>
          <Tabs
            variant="pill"
            options={REPORT_REASONS}
            activeValue={activeReason}
            onChange={setActiveReason}
          />
        </div>

        {/* 상세 내용 */}
        <TextareaField
          label="상세 내용 (선택)"
          placeholder="신고 사유에 대한 상세한 내용을 입력해주세요."
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          maxLength={300}
          showCount
        />

        {/* 에러 메시지 */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* 하단 버튼 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" style={{ flex: 1, padding: 0 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '신고 처리 중...' : '신고하기'}
          </Button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
