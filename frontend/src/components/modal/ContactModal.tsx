'use client';

import React, { useState } from 'react';
import styles from './ContactModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { CancelIcon } from '@/components/icons';
import { Tabs, TextareaField, InputField, Button, UploadField } from '@/components/ui';

const USER_CATEGORIES = [
  { value: 'payment', label: '결제/환불' },
  { value: 'account', label: '계정 문제' },
  { value: 'error', label: '시스템 오류' },
  { value: 'objection', label: '이의 제기' },
  { value: 'etc', label: '기타' },
];

const HOST_CATEGORIES = [
  { value: 'auth', label: '사업자 인증' },
  { value: 'billing', label: '정산 문의' },
  { value: 'event', label: '이벤트 관리' },
  { value: 'error', label: '시스템 오류' },
  { value: 'etc', label: '기타' },
];

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'user' | 'host';
  onSubmit?: (data: {
    category: string;
    title: string;
    content: string;
    attachment?: File | null;
  }) => void;
}

export default function ContactModal({
  isOpen,
  onClose,
  role = 'user',
  onSubmit,
}: ContactModalProps) {
  const categories = role === 'host' ? HOST_CATEGORIES : USER_CATEGORIES;

  const [activeCategory, setActiveCategory] = useState(categories[0].value);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setActiveCategory(categories[0].value);
    setTitle('');
    setContent('');
    setAttachment(null);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (content.trim().length < 10) {
      setError('문의 내용은 최소 10자 이상 입력해주세요.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      onSubmit?.({
        category: activeCategory,
        title: title.trim(),
        content: content.trim(),
        attachment,
      });
      handleClose();
    } catch {
      setError('문의 등록 중 오류가 발생했습니다.');
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
            <h2 className={styles.title}>1:1 문의</h2>
            <p className={styles.subtitle}>
              {role === 'host'
                ? '관리자에게 직접 문의하거나 요청사항을 전달해주세요.'
                : '궁금한 점이나 불편사항을 남겨주시면 빠르게 답변드립니다.'}
            </p>
          </div>
          <CancelIcon
            style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }}
            onClick={handleClose}
          />
        </div>

        {/* 카테고리 선택 */}
        <div className={styles.fieldWrapper}>
          <span className={styles.fieldLabel}>문의 유형</span>
          <Tabs
            variant="pill"
            options={categories}
            activeValue={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* 제목 */}
        <InputField
          label="제목"
          placeholder="문의 제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />

        {/* 내용 */}
        <TextareaField
          label="문의 내용"
          placeholder="문의 내용을 자세히 작성해주세요. (최소 10자)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={1000}
          showCount
        />

        {/* 첨부파일 */}
        <UploadField
          label="첨부파일 (선택)"
          accept="image/*,.pdf"
          onFileSelect={(file) => setAttachment(file)}
        />

        {/* 에러 */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* 하단 버튼 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" style={{ flex: 1, padding: 0 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '전송 중...' : '문의 전송'}
          </Button>
        </div>

      </ModalCard>
    </ModalOverlay>
  );
}
