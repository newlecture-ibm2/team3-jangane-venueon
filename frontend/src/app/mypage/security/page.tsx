'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Button, InputField } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import styles from './page.module.css';
import { useSecurity } from './useSecurity';

export default function SecuritySettingsPage() {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isPasswordMismatch,
    isDirty,
    canSubmit,
    handleCancelClick,
    handleCancelConfirm,
    handleSave,
  } = useSecurity();

  return (
    <div className="container-sidebar">
      {/* Sidebar: role="user" */}
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>계정 보안</h1>

          <div className={styles.profileSection}>
            <div className={styles.formGroup}>
              <InputField 
                label="현재 비밀번호" 
                type="password"
                placeholder="현재 사용 중인 비밀번호 입력" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <InputField 
                label="새 비밀번호 입력" 
                type="password"
                placeholder="새로운 비밀번호를 입력해주세요" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <InputField 
                label="새 비밀번호 확인" 
                type="password"
                placeholder="비밀번호를 한번 더 입력해주세요" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={isPasswordMismatch ? "새 비밀번호가 일치하지 않습니다." : undefined}
                reserveError={true}
              />
            </div>

            <div className={styles.actionButtons}>
              <Button 
                variant="secondary" 
                size="large" 
                disabled={!isDirty} 
                onClick={handleCancelClick}
              >
                취소
              </Button>
              <Button 
                variant="primary" 
                size="large" 
                disabled={!canSubmit}
                onClick={handleSave}
              >
                비밀번호 변경
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        status="danger"
        title="수정 사항을 취소하시겠습니까?"
        subtitle="지금까지 입력한 비밀번호 내용이 모두 사라집니다."
        cancelText="계속 수정하기"
        confirmText="초기화"
      />
    </div>
  );
}
