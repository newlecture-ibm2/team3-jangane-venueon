'use client';

import React from 'react';
import styles from './ModalCard.module.css';

interface ModalCardProps {
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export default function ModalCard({ size = 'sm', children }: ModalCardProps) {
  return (
    <div className={`${styles.modalCard} ${size === 'sm' ? styles.sizeSm : styles.sizeMd}`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
