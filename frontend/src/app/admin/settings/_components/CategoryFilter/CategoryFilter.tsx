import React from 'react';
import { InputField, Button } from '@/components/ui';
import styles from './CategoryFilter.module.css';

interface CategoryFilterProps {
  searchKeyword: string;
  onSearchKeywordChange: (val: string) => void;
  sortByEvent: boolean;
  onSortToggle: () => void;
  onAddClick: () => void;
}

export default function CategoryFilter({
  searchKeyword,
  onSearchKeywordChange,
  sortByEvent,
  onSortToggle,
  onAddClick,
}: CategoryFilterProps) {
  return (
    <>
      <div className={styles.topActionArea}>
        <div className={styles.tabArea}>
          <button className={`${styles.tab} ${styles.activeTab}`}>
            카테고리 관리
          </button>
        </div>
        <Button variant="primary" size="medium" onClick={onAddClick}>
          + 새 카테고리 추가
        </Button>
      </div>

      <div className={styles.searchAddArea}>
        <div className={styles.searchArea}>
          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <InputField
                variant="search"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => onSearchKeywordChange(e.target.value)}
              />
            </div>
            <Button
              variant={sortByEvent ? "primary" : "secondary"}
              size="medium"
              onClick={onSortToggle}
            >
              {sortByEvent ? '기본 순서 보기' : '이벤트 많은 순'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
