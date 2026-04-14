'use client';

import React from 'react';
import styles from './UserFilter.module.css';
import { SearchIcon } from '@/components/icons';
import { Tabs } from '@/components/ui';

interface UserFilterProps {
  keyword: string;
  role: string;
  activeStatus: string; // '', 'true' (활성), 'false' (승인대기/정지)
  onKeywordChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onSearch: () => void;
}

export default function UserFilter({
  keyword,
  role,
  activeStatus,
  onKeywordChange,
  onRoleChange,
  onActiveChange,
  onSearch,
}: UserFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className={styles.container}>
      {/* 탭 영역 (Tabs 컴포넌트 활용) */}
      <div className={styles.tabArea}>
        <Tabs
          variant="line"
          options={[
            { value: '3', label: '주최자 관리' },
            { value: '2', label: '수강생 관리' },
          ]}
          activeValue={role}
          onChange={onRoleChange}
        />
      </div>

      {/* 검색 및 필터 버튼 영역 */}
      <div className={styles.searchFilterArea}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.buttonArea}>
          <button 
            className={activeStatus === '' ? `${styles.filterButton} ${styles.active}` : styles.filterButton}
            onClick={() => onActiveChange('')}
          >
            전체
          </button>
          {/* DB상 active=false는 승인대기 또는 정지로 해석됨 */}
          <button 
            className={activeStatus === 'false' ? `${styles.filterButton} ${styles.active}` : styles.filterButton}
            onClick={() => onActiveChange('false')}
          >
            승인대기 / 정지
          </button>
          <button 
            className={activeStatus === 'true' ? `${styles.filterButton} ${styles.active}` : styles.filterButton}
            onClick={() => onActiveChange('true')}
          >
            활성
          </button>
        </div>
      </div>
    </div>
  );
}
