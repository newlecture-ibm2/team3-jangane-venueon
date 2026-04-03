'use client';

import React from 'react';
import styles from './Radio.module.css';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export default function Radio({ label, className = '', ...props }: RadioProps) {
  return (
    <label className={`${styles.radio} ${className}`.trim()}>
      <input type="radio" className={styles.radioInput} {...props} />
      <span className={styles.radioBox}></span>
      {label && <span className={styles.radioLabel}>{label}</span>}
    </label>
  );
}
