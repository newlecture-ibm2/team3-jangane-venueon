import React from 'react';
import { Tabs, InputField } from '@/components/ui';
import styles from './CommunityFilter.module.css';

interface CommunityFilterProps {
  activeTab: string;
  onTabChange: (val: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const TAB_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'GENERAL', label: '일반 커뮤니티' },
  { value: 'EVENT', label: '이벤트 연동' },
];

export default function CommunityFilter({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: CommunityFilterProps) {
  return (
    <div className={styles.filterContainer}>
      <Tabs
        variant="line"
        options={TAB_OPTIONS}
        activeValue={activeTab}
        onChange={onTabChange}
      />

      <InputField
        variant="search"
        className={styles.searchBar}
        placeholder="커뮤니티 이름 또는 태그로 검색하세요"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
