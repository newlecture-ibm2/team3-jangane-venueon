'use client';

import React from 'react';
import styles from './FilePreviewList.module.css';
import { CancelIcon, FileImageIcon, FilePdfIcon, FileTxtIcon, FileZipIcon, FileAddIcon } from '@/components/icons';

export interface FileItem {
  /** File 객체이거나, 서버에서 받아온 파일 정보 */
  name: string;
  size?: number; // bytes
  url?: string;  // 클릭 시 열 링크 (서버 저장 파일용)
}

export interface FilePreviewListProps {
  /** 표시할 파일 목록 */
  files: FileItem[];
  /** 삭제 콜백 — 없으면 readonly (X 버튼 숨김) */
  onRemove?: (index: number) => void;
  /** 파일 클릭 콜백 — 미리보기/다운로드 용도 */
  onClickFile?: (file: FileItem, index: number) => void;
}

/** 바이트를 사람이 읽기 쉬운 단위로 변환 */
function formatFileSize(bytes?: number): string {
  if (bytes == null || bytes === 0) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** 파일 확장자에 따라 알맞은 아이콘 반환 */
function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconStyle = { width: 20, height: 20, flexShrink: 0, color: 'var(--color-text-gray-500)' };

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return <FileImageIcon style={iconStyle} />;
  }
  if (ext === 'pdf') {
    return <FilePdfIcon style={iconStyle} />;
  }
  if (['doc', 'docx', 'txt', 'hwp', 'rtf', 'odt'].includes(ext)) {
    return <FileTxtIcon style={iconStyle} />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileZipIcon style={iconStyle} />;
  }
  return <FileAddIcon style={iconStyle} />;
}

export default function FilePreviewList({ files, onRemove, onClickFile }: FilePreviewListProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className={styles.list}>
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className={styles.chip}>
          {/* 파일 타입별 아이콘 */}
          {getFileIcon(file.name)}

          {/* 파일명 (클릭 가능 시 링크 스타일) */}
          <span
            className={`${styles.fileName} ${onClickFile ? styles.clickable : ''}`}
            onClick={() => onClickFile?.(file, index)}
            title={file.name}
          >
            {file.name}
          </span>

          {/* 용량 */}
          {file.size != null && file.size > 0 && (
            <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
          )}

          {/* 삭제 버튼 (onRemove가 있을 때만) */}
          {onRemove && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              aria-label={`${file.name} 삭제`}
            >
              <CancelIcon style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
