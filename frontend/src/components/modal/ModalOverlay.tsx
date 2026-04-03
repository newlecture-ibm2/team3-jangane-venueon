'use client';

import React, { useEffect } from 'react';
import styles from './ModalOverlay.module.css';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalOverlay({ isOpen, onClose, children }: ModalOverlayProps) {
  // ESC 키로 닫기 등 부가 기능 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {children}
    </div>
  );
}
