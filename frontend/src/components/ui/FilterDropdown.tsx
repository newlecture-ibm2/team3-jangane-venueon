'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './FilterDropdown.module.css';
import { ArrowDownIcon } from '@/components/icons';
import PopoverMenu from './PopoverMenu';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
}

export default function FilterDropdown({
  options,
  value,
  onChange,
  className = ''
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 객체 찾기
  const selectedOption = options.find((opt) => opt.value === value);

  // 바깥 클릭 감지
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
    setIsOpen(false);
  };

  return (
    <div className={`${styles.wrapper} ${className}`.trim()} ref={wrapperRef}>
      <button 
        className={styles.triggerButton} 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={styles.textSelected}>
          {selectedOption ? selectedOption.label : '옵션 선택'}
        </span>
        <div className={`${styles.iconWrapper} ${isOpen ? styles.iconExpanded : ''}`}>
          <ArrowDownIcon />
        </div>
      </button>

      {isOpen && (
        <PopoverMenu
          items={options}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
          selectedValue={value}
          width="max-content"
          style={{ top: '100%', left: 0, marginTop: '4px' }}
        />
      )}
    </div>
  );
}
