'use client';

import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export default function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`${styles.checkbox} ${className}`.trim()}>
      <input type="checkbox" className={styles.checkboxInput} {...props} />
      <span className={styles.checkboxBox}></span>
      {label && <span className={styles.checkboxLabel}>{label}</span>}
    </label>
  );
}
