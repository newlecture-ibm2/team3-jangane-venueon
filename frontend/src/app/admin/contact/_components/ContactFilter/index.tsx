'use client';

import React from 'react';
import styles from './ContactFilter.module.css';
import { Tabs, InputField } from '@/components/ui';

interface ContactFilterProps {
  keyword: string;
  category: string;
  status: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const CATEGORY_TABS = [
  { value: '', label: '전체' },
  { value: 'PAYMENT', label: '결제/환불' },
  { value: 'ACCOUNT', label: '계정 문제' },
  { value: 'SYSTEM_ERROR', label: '시스템 오류' },
  { value: 'OBJECTION', label: '이의 제기' },
  { value: 'BILLING', label: '정산 문의' },
  { value: 'EVENT_MANAGEMENT', label: '이벤트 관리' },
  { value: 'OTHER', label: '기타' },
];

const STATUS_TABS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '대기 중' },
  { value: 'REVIEWING', label: '검토 중' },
  { value: 'COMPLETED', label: '처리 완료' },
  { value: 'REJECTED', label: '반려' },
];

export default function ContactFilter({
  keyword,
  category,
  status,
  onKeywordChange,
  onSearch,
  onCategoryChange,
  onStatusChange,
}: ContactFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className={styles.container}>
      {/* 1줄: 상위 카테고리 (라인 탭) */}
      <div className={styles.tabArea}>
        <Tabs
          variant="line"
          options={CATEGORY_TABS}
          activeValue={category}
          onChange={onCategoryChange}
        />
      </div>

      {/* 2줄: 검색 바 + 상태 필터 (필 탭) */}
      <div className={styles.searchFilterArea}>
        <InputField
          variant="search"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.searchComponent}
        />
        
        <div className={styles.buttonArea}>
          <Tabs
            variant="pill"
            options={STATUS_TABS}
            activeValue={status}
            onChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
