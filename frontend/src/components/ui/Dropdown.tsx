'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';
import { ArrowDownIcon } from '@/components/icons';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  /** 라벨 텍스트 */
  label?: string;
  /** 선택 전 빈 상태일 때 보여줄 텍스트 */
  placeholder?: string;
  /** 선택지 목록 배열 */
  options: DropdownOption[];
  /** 현재 선택된 값 */
  value?: string;
  /** 값이 선택되었을 때 발생할 콜백 함수 */
  onChange?: (val: string) => void;
  className?: string;
}

export default function Dropdown({
  label,
  placeholder = '옵션을 선택하세요.',
  options,
  value,
  onChange,
  className = ''
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 객체 찾기
  const selectedOption = options.find((opt) => opt.value === value);

  // 바깥을 클릭하면 드롭다운 닫히게 하는 기능
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false); // 선택 후 메뉴 닫기
  };

  return (
    <div className={`${styles.wrapper} ${className}`.trim()} ref={wrapperRef}>
      
      {/* 1. 라벨 영역 */}
      {label && (
        <div className={styles.labelWrapper}>
          <h4 className={styles.label}>{label}</h4>
        </div>
      )}

      {/* 2. 트리거 박스 (클릭 시 열림) */}
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? (
          <span className={styles.textSelected}>{selectedOption.label}</span>
        ) : (
          <span className={styles.textPlaceholder}>{placeholder}</span>
        )}
        
        <div className={`${styles.iconWrapper} ${isOpen ? styles.iconExpanded : ''}`}>
          <ArrowDownIcon />
        </div>
      </div>

      {/* 3. 드롭다운 팝업 리스트 */}
      {isOpen && (
        <div className={styles.list}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div 
                key={opt.value} 
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className={styles.menuItemText}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
