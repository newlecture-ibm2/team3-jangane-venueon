'use client';

import React from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Toggle({ label, className = '', ...props }: ToggleProps) {
  return (
    <label className={`${styles.toggle} ${className}`.trim()}>
      <input type="checkbox" className={styles.toggleInput} {...props} />
      <div className={styles.toggleTrack}>
        <div className={styles.toggleCircle}></div>
      </div>
      {label && <span className={styles.toggleLabel}>{label}</span>}
    </label>
  );
}
