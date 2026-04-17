'use client';

import React from 'react';
import styles from './Tabs.module.css';

export interface TabOption {
  value: string;
  label: string;
}

export interface TabsProps {
  /** 탭의 시각적 형태: 텍스트+밑줄(line) 또는 알약 모양 버튼(pill) */
  variant?: 'line' | 'pill';
  /** 출력할 탭 데이터 목록 */
  options: TabOption[];
  /** 현재 선택된 탭의 value (단일 선택 시) */
  activeValue?: string;
  /** 선택된 탭들의 value 배열 (다중 선택 시) */
  activeValues?: string[];
  /** 탭 변경 시 호출될 콜백 함수 */
  onChange: (value: string) => void;
  className?: string;
}

export default function Tabs({
  variant = 'line',
  options,
  activeValue,
  activeValues,
  onChange,
  className = ''
}: TabsProps) {
  const containerClass = variant === 'line' ? styles.variantLine : styles.variantPill;

  return (
    <div className={`${styles.container} ${containerClass} ${className}`.trim()} role="tablist">
      {options.map((option) => {
        const isActive = activeValues 
          ? activeValues.includes(option.value)
          : option.value === activeValue;
        
        let tabClass = styles.tabButton;
        if (variant === 'line') {
          tabClass += ` ${styles.lineTab} ${isActive ? styles.lineTabActive : ''}`;
        } else {
          tabClass += ` ${styles.pillTab} ${isActive ? styles.pillTabActive : ''}`;
        }

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            className={tabClass.trim()}
            onClick={() => {
              if (activeValues) {
                onChange(option.value);
              } else {
                onChange(isActive ? '' : option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
