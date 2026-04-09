'use client';

import React from 'react';
import styles from './InputField.module.css';
import { SearchIcon } from '@/components/icons';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 라벨 텍스트. 검색바 형태일 경우 표시되지 않습니다. */
  label?: string;
  /** 에러 메시지. 값이 들어오면 에러 UI로 변경되며 텍스트가 노출됩니다. */
  error?: string;
  /** 화면 밀림(Layout Shift) 방지를 위해 하단에 빈 20px 영역을 항상 확보할지 여부 */
  reserveError?: boolean;
  /** 일반적인 입력창(default)인지, 검색창(search)인지 결정 */
  variant?: 'default' | 'search';
}

export default function InputField({
  label,
  error,
  reserveError = false,
  variant = 'default',
  disabled,
  className = '',
  ...props
}: InputFieldProps) {
  // 1. Search Bar 렌더링
  if (variant === 'search') {
    return (
      <div className={`${styles.searchContainer} ${className}`.trim()}>
        <div className={styles.searchIconWrapper}>
          <SearchIcon />
        </div>
        <input 
          className={styles.inputElement} 
          disabled={disabled}
          placeholder={props.placeholder || '검색어를 입력하세요'}
          {...props} 
        />
      </div>
    );
  }

  // 2. Default Input Field 렌더링
  const isError = !!error;
  
  const containerClasses = [
    styles.inputContainer,
    isError ? styles.inputContainerError : '',
    disabled ? styles.inputContainerDisabled : ''
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    styles.wrapper,
    reserveError ? styles.reserveError : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <div className={styles.inputGroup}>
        {label && (
          <div className={styles.labelWrapper}>
            <label className={styles.label}>{label}</label>
          </div>
        )}
        
        <div className={containerClasses}>
          <input 
            className={styles.inputElement}
            disabled={disabled}
            {...props} 
          />
        </div>
      </div>
      
      {/* 에러 메시지 렌더링 (또는 reserveError일 때의 투명 공간) */}
      {(isError || reserveError) && (
        <div className={styles.errorWrapper}>
          {isError && <span className={styles.errorText}>{error}</span>}
        </div>
      )}
    </div>
  );
}
