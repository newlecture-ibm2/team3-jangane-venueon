import React from 'react';
import { Checkbox, InputField, Tabs } from '@/components/ui';
import styles from './EventFilter.module.css';

interface Category {
  id: number;
  name: string;
}

interface EventFilterProps {
  activeTab: string;
  showHiddenOnly: boolean;
  searchKeyword: string;
  selectedCategoryId: number | null;
  categories: Category[];
  onTabChange: (tab: string) => void;
  onHiddenOnlyChange: (hidden: boolean) => void;
  onSearchChange: (keyword: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function EventFilter({
  activeTab,
  showHiddenOnly,
  searchKeyword,
  selectedCategoryId,
  categories,
  onTabChange,
  onHiddenOnlyChange,
  onSearchChange,
  onCategoryChange,
}: EventFilterProps) {
  const tabs = [
    { value: 'ALL', label: '전체' },
    { value: 'READY', label: '게시 전' },
    { value: 'RECRUITING', label: '모집 중' },
    { value: 'CLOSED', label: '종료' },
  ];

  const categoryOptions = [
    { value: 'all', label: '전체' },
    ...categories.map(c => ({ value: String(c.id), label: c.name }))
  ];

  return (
    <div className={styles.filterContainer}>
      {/* 1) 상단 탭 + 필터 */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          <Tabs
            variant="line"
            options={tabs}
            activeValue={activeTab}
            onChange={(val) => onTabChange(val || 'ALL')}
          />
        </div>
        <div className={styles.checkboxArea}>
          <Checkbox
            label="숨김 처리된 강의 보기"
            checked={showHiddenOnly}
            onChange={(e) => onHiddenOnlyChange(e.target.checked)}
          />
        </div>
      </div>

      {/* 2) 검색바 (공통 InputField 활용) */}
      <div className={styles.filterRow}>
        <InputField
          variant="search"
          placeholder="강의 제목으로 검색하세요"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 3) 카테고리 필터 영역 */}
      <div className={styles.categoryRow}>
        <div className={styles.categoryChips}>
          <Tabs
            variant="pill"
            options={categoryOptions}
            activeValue={selectedCategoryId === null ? 'all' : String(selectedCategoryId)}
            onChange={(val) => onCategoryChange(!val || val === 'all' ? null : Number(val))}
          />
        </div>
      </div>
    </div>
  );
}
