'use client';

import React, { useRef, useState } from 'react';
import styles from './UploadField.module.css';
import { UploadIcon } from '@/components/icons';
import FilePreviewList from './FilePreviewList';

export interface UploadFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'multiple'> {
  /** 라벨 텍스트 */
  label?: string;
  /** 단일 파일 선택 콜백 (하위호환) */
  onFileSelect?: (file: File | null) => void;
  /** 다중 파일 변경 콜백 */
  onFilesChange?: (files: File[]) => void;
  /** 다중 파일 허용 여부 */
  multiple?: boolean;
}

export default function UploadField({ label, onFileSelect, onFilesChange, multiple = false, className = '', ...props }: UploadFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const updated = multiple ? [...selectedFiles, ...filesArray] : filesArray.slice(0, 1);
    setSelectedFiles(updated);
    onFilesChange?.(updated);
    // 하위호환: 단일 파일 콜백
    if (onFileSelect) {
      onFileSelect(updated.length > 0 ? updated[0] : null);
    }
  };

  // 드래그 앤 드롭 핸들러
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // 탐색기 창 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesChange?.(updated);
    if (onFileSelect) {
      onFileSelect(updated.length > 0 ? updated[0] : null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          multiple={multiple}
          {...props}
        />
        
        <div className={styles.iconWrapper}>
          <UploadIcon />
        </div>
        
        <span className={styles.text}>
          클릭하거나 파일을 여기로 끌어다 놓으세요
        </span>
      </div>

      {selectedFiles.length > 0 && (
        <FilePreviewList
          files={selectedFiles.map(f => ({ name: f.name, size: f.size }))}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}
