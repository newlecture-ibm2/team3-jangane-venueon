import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outlined';
  size?: 'medium' | 'large';
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClass = styles.btn;
  const variantClass = variant === 'primary'
    ? styles.primary
    : variant === 'secondary'
      ? styles.secondary
      : variant === 'outlined'
        ? styles.outlined
        : styles.danger;
  const sizeClass = size === 'large' ? styles.large : styles.medium;


  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
