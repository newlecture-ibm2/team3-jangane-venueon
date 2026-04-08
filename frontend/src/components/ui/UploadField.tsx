'use client';

import React, { useRef, useState } from 'react';
import styles from './UploadField.module.css';
import { UploadIcon } from '@/components/icons';

export interface UploadFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 라벨 텍스트 */
  label?: string;
  /** 파일이 선택되거나 드롭되었을 때 실행될 콜백 */
  onFileSelect?: (file: File) => void;
}

export default function UploadField({ label, onFileSelect, className = '', ...props }: UploadFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 앤 드롭 세션 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  // 탐색기 창 선택 세션 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      
      {/* 1. 라벨 (제목) */}
      {label && (
        <div className={styles.labelWrapper}>
          <h4 className={styles.label}>{label}</h4>
        </div>
      )}
      
      {/* 2. 드롭존 영역 (점선 박스) */}
      <div 
        className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className={styles.hiddenInput} 
          ref={fileInputRef}
          onChange={handleFileChange}
          {...props}
        />
        
        <div className={styles.iconWrapper}>
          <UploadIcon />
        </div>
        
        <span className={styles.text}>
          {fileName ? fileName : '클릭하거나 파일을 여기로 끌어다 놓으세요'}
        </span>
      </div>
    </div>
  );
}
