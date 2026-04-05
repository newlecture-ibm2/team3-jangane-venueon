'use client';

import React, { useState } from 'react';
import styles from './CommentInput.module.css';
import Button from './Button';

export interface CommentInputProps {
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 등록 버튼 텍스트 */
  submitText?: string;
  /** 등록 시 호출되는 콜백 (입력값 전달 후 초기화) */
  onSubmit?: (value: string) => void;
  /** 외부에서 비활성화 제어 */
  disabled?: boolean;
}

export default function CommentInput({
  placeholder = '댓글을 입력하세요..',
  submitText = '등록',
  onSubmit,
  disabled = false,
}: CommentInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    /* Ctrl/Cmd + Enter로도 제출 가능 */
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.wrapper}>
      <textarea
        className={styles.textarea}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button
        variant="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        type="button"
      >
        {submitText}
      </Button>
    </div>
  );
}
