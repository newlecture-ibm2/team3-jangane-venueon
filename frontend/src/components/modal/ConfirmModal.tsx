'use client';

import React, { useState, useEffect } from 'react';
import styles from './ConfirmModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { AttentionIcon, CancelIcon } from '@/components/icons';
import { Checkbox, Button } from '@/components/ui';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  status?: 'default' | 'danger';
  requireCheckbox?: boolean;
  checkboxLabel?: string;
  cancelText?: string;
  confirmText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  status = 'default',
  requireCheckbox = false,
  checkboxLabel,
  cancelText = '취소',
  confirmText = '확인',
}: ConfirmModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) setIsChecked(false);
  }, [isOpen]);

  const isConfirmDisabled = requireCheckbox && !isChecked;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="sm">
        {/* 상단바 (status===danger일때만) */}
        {status === 'danger' && (
          <div className={styles.topBar}>
            <AttentionIcon />
            <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)' }} onClick={onClose} />
          </div>
        )}

        {/* 텍스트 영역 */}
        <div className={styles.textWrapper}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* 체크박스 영역 */}
        {requireCheckbox && checkboxLabel && (
          <div className={styles.checkboxContainer}>
            <Checkbox 
              label={checkboxLabel} 
              checked={isChecked} 
              onChange={(e) => setIsChecked(e.target.checked)} 
            />
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={status === 'danger' ? 'danger' : 'primary'}
            style={{ flex: 1, padding: 0 }}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
            </ModalCard>
    </ModalOverlay>
  );
}
