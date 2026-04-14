'use client';

import React from 'react';
import styles from './FilterChip.module.css';

interface FilterChipProps {
  label: string;
  onClose: () => void;
}

export default function FilterChip({ label, onClose }: FilterChipProps) {
  return (
    <div className={styles.chip}>
      <span>{label}</span>
      <button className={styles.closeButton} onClick={onClose} aria-label="필터 해제">
        <svg className={styles.icon} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
