import React from 'react';
import styles from './SelectBox.module.css';

export interface SelectBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; // 체크박스 우측에 나타날 텍스트
}

export default function SelectBox({ label, className = '', ...props }: SelectBoxProps) {
  // 동일한 name 그룹 내에서 단일 선택을 하도록 input type="radio"를 숨겨서 사용합니다.
  const isSelected = props.checked || false;
  
  return (
    <label className={`${styles.selectBox} ${isSelected ? styles.selected : styles.default} ${className}`.trim()}>
      <input type="radio" className={styles.hiddenInput} {...props} />
      
      {/* 20x20 가짜 라디오 버튼 원 */}
      <div className={`${styles.radioCircle} ${isSelected ? styles.radioSelected : styles.radioDefault}`}>
        {isSelected && <div className={styles.radioCheck} />}
      </div>
      
      {/* 텍스트 */}
      <span className={styles.textLabel}>{label}</span>
    </label>
  );
}
