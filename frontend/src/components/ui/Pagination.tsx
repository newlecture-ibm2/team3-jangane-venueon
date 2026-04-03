import React from 'react';
import styles from './Pagination.module.css';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}: PaginationProps) {
  
  if (totalPages <= 0) return null;

  // 피그마: < 1 2 3 ... 23 > 등 5슬롯으로 보여주기
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // 앞쪽 (1, 2, 3, ..., 23)
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    
    // 뒤쪽 (1, ..., 21, 22, 23)
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    
    // 중간 (1, ..., current, ..., 23)
    return [1, '...', currentPage, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`${styles.paginationWrapper} ${className}`.trim()}>
      <nav className={styles.pagination} aria-label="Pagination">
        {/* 이전 페이지 화살표 버튼 */}
        <button 
          className={styles.pageButton} 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="이전 페이지"
        >
          <ArrowLeftIcon color="var(--color-text-gray-900)" />
        </button>

        {/* 페이지 숫자 버튼들 */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                ...
              </span>
            );
          }
          
          const pageNum = page as number;
          return (
            <button
              key={`page-${pageNum}`}
              className={`${styles.pageButton} ${pageNum === currentPage ? styles.selected : ''}`}
              onClick={() => onPageChange(pageNum)}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* 다음 페이지 화살표 버튼 */}
        <button 
          className={styles.pageButton} 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="다음 페이지"
        >
          <ArrowRightIcon color="var(--color-text-gray-900)" />
        </button>
      </nav>
    </div>
  );
}
