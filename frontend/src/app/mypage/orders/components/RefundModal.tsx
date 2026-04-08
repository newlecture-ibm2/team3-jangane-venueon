'use client';

import React, { useState } from 'react';
import styles from './RefundModal.module.css';
import { ModalOverlay, ModalCard } from '@/components/modal';
import { CancelIcon } from '@/components/icons';
import { Tabs, TextareaField, Button, Checkbox } from '@/components/ui';

export interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RefundModal({
  isOpen,
  onClose,
  onConfirm,
}: RefundModalProps) {
  const categories = [
    { value: '단순 변심', label: '단순 변심' },
    { value: '일정 변경', label: '일정 변경' },
    { value: '결제 시도 오류', label: '결제 시도 오류' },
    { value: '기타', label: '기타' },
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0].value);
  const [detailReason, setDetailReason] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!isConfirmed) {
      alert('환불 유의사항을 확인하고 동의해주세요.');
      return;
    }
    
    // reason 조합
    const finalReason = activeCategory === '기타' 
      ? `기타: ${detailReason}` 
      : activeCategory;

    onConfirm(finalReason);
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        
        {/* 상단 텍스트 및 닫기 버튼 */}
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>결제 취소 / 환불 신청</h2>
            <p className={styles.subtitle}>환불 사유를 알려주시면 더 나은 서비스로 보답하겠습니다.</p>
          </div>
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }} onClick={onClose} />
        </div>

        {/* 사유 Pill 탭 선택 */}
        <div className={styles.inputFieldWrapper}>
          <span className={styles.inputLabel}>환불 사유 선택</span>
          <Tabs 
            variant="pill" 
            options={categories} 
            activeValue={activeCategory} 
            onChange={setActiveCategory} 
          />
        </div>

        {/* 기타 선택 시 나오는 텍스트 에어리어 */}
        {activeCategory === '기타' && (
          <div className={styles.textAreaWrapper}>
            <TextareaField 
              label="상세 사유 입력" 
              placeholder="구체적인 사유를 입력해주세요..." 
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
            />
          </div>
        )}

        {/* 유의사항 동의 체크박스 (표준 Styling) */}
        <div className={styles.checkboxContainer}>
          <Checkbox 
            label="[필수] 환불 시 세션 참여가 취소되며, 처리 후에는 복구할 수 없습니다."
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
          />
        </div>

        {/* 하단 액션 버튼 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, height: '48px' }} onClick={onClose}>
            취소
          </Button>
          <Button 
            variant="danger" 
            style={{ flex: 1, height: '48px' }} 
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            환불 신청 완료
          </Button>
        </div>

      </ModalCard>
    </ModalOverlay>
  );
}
