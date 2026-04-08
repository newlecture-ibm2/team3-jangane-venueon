'use client';

import React from 'react';
import styles from './UserFilter.module.css';
import { InputField, Dropdown } from '@/components/ui';

interface UserFilterProps {
  keyword: string;
  role: string;
  onKeywordChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSearch: () => void;
}

const roleOptions = [
  { value: '', label: '전체' },
  { value: 'USER', label: '일반 회원' },
  { value: 'HOST', label: '주최자' },
  { value: 'ADMIN', label: '관리자' },
];

export default function UserFilter({
  keyword,
  role,
  onKeywordChange,
  onRoleChange,
  onSearch,
}: UserFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchWrapper}>
        <InputField
          variant="search"
          placeholder="이메일 또는 닉네임 검색"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className={styles.dropdownWrapper}>
        <Dropdown
          placeholder="역할 필터"
          options={roleOptions}
          value={role}
          onChange={onRoleChange}
        />
      </div>
    </div>
  );
}
