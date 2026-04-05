'use client';

import React, { useRef, useEffect } from 'react';
import styles from './PopoverMenu.module.css';

export interface PopoverMenuItem {
  value: string;
  label: string;
}

export interface PopoverMenuProps {
  /** 메뉴 항목 목록 */
  items: PopoverMenuItem[];
  /** 항목 클릭 시 콜백 */
  onSelect: (value: string) => void;
  /** 메뉴 닫기 콜백 (바깥 클릭 시) */
  onClose: () => void;
  /** 현재 선택된 값 (선택 표시용, optional) */
  selectedValue?: string;
  /** 메뉴 너비 (기본: 240px) */
  width?: number | string;
  /** 추가 스타일 */
  style?: React.CSSProperties;
  className?: string;
}

export default function PopoverMenu({
  items,
  onSelect,
  onClose,
  selectedValue,
  width = 240,
  style,
  className = '',
}: PopoverMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  /* 바깥 클릭 시 닫기 */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`${styles.menu} ${className}`.trim()}
      style={{ width, ...style }}
    >
      {items.map((item) => {
        const isSelected = item.value === selectedValue;
        return (
          <div
            key={item.value}
            className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
            onClick={() => onSelect(item.value)}
          >
            <span className={styles.menuItemText}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
