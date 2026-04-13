'use client';

import React, { useState, useEffect } from 'react';
import styles from './UploadModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { CancelIcon } from '@/components/icons';
import { Checkbox, UploadField, Button, FilePreviewList } from '@/components/ui';

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File | null) => void;
  
  title: string;
  subtitle?: string;
  
  uploadLabel?: string;
  accept?: string;
  
  requireCheckbox?: boolean;
  checkboxLabel?: string;
  
  cancelText?: string;
  confirmText?: string;
}

export default function UploadModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  uploadLabel = '파일 업로드',
  accept,
  requireCheckbox = false,
  checkboxLabel,
  cancelText = '취소',
  confirmText = '확인',
}: UploadModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setSelectedFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmDisabled = (requireCheckbox && !isChecked) || !selectedFile;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }} onClick={onClose} />
        </div>

        <div className={styles.uploadWrapper}>
          <UploadField 
            label={uploadLabel} 
            accept={accept} 
            onFileSelect={setSelectedFile}
          />
        </div>

        {requireCheckbox && checkboxLabel && (
          <div className={styles.checkboxContainer}>
            <Checkbox 
              label={checkboxLabel} 
              checked={isChecked} 
              onChange={(e) => setIsChecked(e.target.checked)} 
            />
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant="primary"
            style={{ flex: 1, padding: 0 }}
            onClick={() => onConfirm(selectedFile)}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </div>

            </ModalCard>
    </ModalOverlay>
  );
}
