import React from 'react';
import { Checkbox, InputField } from '@/components/ui';
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
    { key: 'ALL', label: '전체' },
    { key: 'READY', label: '게시 전' },
    { key: 'RECRUITING', label: '모집 중' },
    { key: 'CLOSED', label: '종료' },
  ];

  return (
    <div className={styles.filterContainer}>
      {/* 1) 상단 탭 + 필터 */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
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
        <div className={styles.searchArea}>
          <InputField
            variant="search"
            placeholder="강의 제목으로 검색하세요"
            className={styles.searchInput}
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* 3) 카테고리 필터 영역 */}
      <div className={styles.categoryRow}>
        <div className={styles.categoryChips}>
          <button
            className={`${styles.chip} ${selectedCategoryId === null ? styles.activeChip : ''}`}
            onClick={() => onCategoryChange(null)}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.chip} ${selectedCategoryId === cat.id ? styles.activeChip : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
