'use client';

import React, { useState } from 'react';
import styles from './InputModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { CancelIcon } from '@/components/icons';
import { Tabs, TextareaField, Button, UserProfile, Tag } from '@/components/ui';

export interface AdminReportData {
  date1: string;
  userName: string;
  userAvatar?: string;
  statusText: string;
  date2: string;
  reasonDetail: string;
}

export interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  
  role: 'user' | 'admin';
  title: string;
  subtitle?: string;
  
  // User 전용 속성 (신고 폼)
  categories?: { value: string; label: string }[];
  
  // Admin 전용 속성 (신고 내역 확인)
  adminData?: AdminReportData;
  
  cancelText?: string;
  confirmText?: string;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  role,
  title,
  subtitle,
  categories = [
    { value: '1', label: '욕설/비방' },
    { value: '2', label: '광고/홍보' },
    { value: '3', label: '사기 의심' },
    { value: '4', label: '기타' },
  ],
  adminData,
  cancelText = '취소',
  confirmText = role === 'user' ? '전송하기' : '확인',
}: InputModalProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value || '');
  const [reportContent, setReportContent] = useState('');

  const handleConfirm = () => {
    if (role === 'user') {
      onConfirm({ category: activeCategory, content: reportContent });
    } else {
      onConfirm(true);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        
        {/* 상단 텍스트 및 닫기 버튼 */}
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }} onClick={onClose} />
        </div>

        {/* User Role (입력 폼) */}
        {role === 'user' && (
          <>
            <div className={styles.inputFieldWrapper}>
              <span className={styles.inputLabel}>신고 사유 선택</span>
              <Tabs 
                variant="pill" 
                options={categories} 
                activeValue={activeCategory} 
                onChange={setActiveCategory} 
              />
            </div>

            <div className={styles.textAreaWrapper}>
              <TextareaField 
                label="상세 내용" 
                placeholder="내용을 입력하세요..." 
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Admin Role (상세 조회) */}
        {role === 'admin' && adminData && (
          <div className={styles.adminBox}>
            <div className={styles.infoLine}>
              <span className={styles.infoLabel}>일정</span>
              <span className={styles.infoValue}>{adminData.date1}</span>
            </div>

            <div className={styles.adminRow}>
              <div className={styles.adminCol}>
                <span className={styles.infoLabel}>신고자</span>
                <UserProfile 
                  name={adminData.userName} 
                  imageUrl={adminData.userAvatar} 
                  size="medium" 
                />
              </div>
              
              <div className={styles.adminCol}>
                <span className={styles.infoLabel}>처리 상태</span>
                <div>
                  <Tag variant="red">{adminData.statusText}</Tag>
                </div>
              </div>
            </div>

            <div className={styles.infoLine}>
              <span className={styles.infoLabel}>신고 일자</span>
              <span className={styles.infoValue}>{adminData.date2}</span>
            </div>

            <div className={styles.infoLine}>
              <span className={styles.infoLabel}>신고 상세 사유</span>
              <span className={styles.infoValue}>{adminData.reasonDetail}</span>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className={styles.buttonGroup}>
          <Button variant="secondary" style={{ flex: 1, padding: 0 }} onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" style={{ flex: 1, padding: 0 }} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>

            </ModalCard>
    </ModalOverlay>
  );
}
