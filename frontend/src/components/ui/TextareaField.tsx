'use client';

import React, { useState } from 'react';
import styles from './TextareaField.module.css';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 입력 필드의 제목 */
  label?: string;
  /** 글자 수를 표시할지 여부 */
  showCount?: boolean;
}

export default function TextareaField({
  label,
  showCount,
  className = '',
  onChange,
  value,
  defaultValue,
  ...props
}: TextareaFieldProps) {
  // 컴포넌트 내부에서 임시로 글자 수를 세기 편하도록 로컬 상태를 가질 수도 있습니다.
  // 상위 컴포넌트에서 value를 내려주면 그걸 우선시합니다.
  const [internalVal, setInternalVal] = useState(defaultValue || '');
  const actualValue = value !== undefined ? value : internalVal;
  
  const currentLength = String(actualValue).length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setInternalVal(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const containerClasses = [
    styles.textareaContainer
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      
      {/* 1. 상단 라벨 & 글자 수 카운터 */}
      {(label || showCount) && (
        <div className={styles.headerWrapper}>
          <h4 className={styles.label}>{label}</h4>
          {showCount && (
            <span className={styles.charCount}>
              {currentLength}
            </span>
          )}
        </div>
      )}

      {/* 2. 실제 텍스트 영역 박스 */}
      <div className={containerClasses}>
        <textarea
          className={styles.textareaElement}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...props}
        />
      </div>
    </div>
  );
}
