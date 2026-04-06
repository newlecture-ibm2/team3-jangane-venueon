'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Button, InputField } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useUIStore } from '@/store/useUIStore';

// 프로필 페이지의 CSS를 재사용합니다
import styles from '../profile/page.module.css';

export default function SecuritySettingsPage() {
  const { showToast } = useUIStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 실시간 유효성 검사 (새 비밀번호 불일치)
  const isPasswordMismatch = newPassword !== '' && confirmPassword !== '' && newPassword !== confirmPassword;

  // 수정 사항이 하나라도 있고, 비밀번호 불일치가 아닐 때만 저장 가능
  const isDirty = currentPassword !== '' || newPassword !== '' || confirmPassword !== '';
  const canSubmit = isDirty && !isPasswordMismatch;

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsCancelModalOpen(false);
  };

  const handleSave = async () => {
    if (isPasswordMismatch || !currentPassword || !newPassword) {
      showToast('비밀번호 입력을 확인해주세요.', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        // 성공 시 초기화
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
      } else {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          showToast(errorData.message || '비밀번호 변경 중 오류가 발생했습니다.', 'error');
        } catch {
          showToast(`오류가 발생했습니다: ${res.status} ${errorText.substring(0, 50)}`, 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className="container-sidebar">
      {/* Sidebar: role="user" */}
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>계정 보안</h1>

          <div className={styles.profileSection}>
            <div className={styles.formGroup} style={{ gap: '24px' }}>
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
