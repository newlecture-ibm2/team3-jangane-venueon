'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/components/modal/InputModal.module.css';
import ModalOverlay from '@/components/modal/ModalOverlay';
import ModalCard from '@/components/modal/ModalCard';
import { CancelIcon } from '@/components/icons';
import { InputField, TextareaField, Button } from '@/components/ui';

export interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  /** 수정 모드일 때 기존 데이터를 전달 */
  initialData?: CategoryFormData | null;
  isSubmitting?: boolean;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setNameError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('카테고리 이름을 입력해주세요.');
      return;
    }
    setNameError('');
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">

        {/* 상단 텍스트 및 닫기 버튼 — InputModal 패턴 */}
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>
              {isEditMode ? '카테고리 수정' : '새 카테고리 추가'}
            </h2>
            <p className={styles.subtitle}>
              {isEditMode 
                ? '카테고리 정보를 수정합니다.' 
                : '새로운 카테고리를 등록합니다.'}
            </p>
          </div>
          <CancelIcon 
            style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }} 
            onClick={onClose} 
          />
        </div>

        {/* 입력 폼 영역 — InputModal의 inputFieldWrapper 패턴 */}
        <div className={styles.inputFieldWrapper}>
          <span className={styles.inputLabel}>카테고리 이름</span>
          <InputField
            placeholder="예: 프로그래밍"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            reserveError
          />
        </div>

        <div className={styles.textAreaWrapper}>
          <TextareaField
            label="설명 (선택)"
            placeholder="카테고리에 대한 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 하단 버튼 — InputModal 패턴 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            style={{ flex: 1, padding: 0 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : isEditMode ? '수정' : '추가'}
          </Button>
        </div>

      </ModalCard>
    </ModalOverlay>
  );
}
