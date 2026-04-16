import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function useSecurity() {
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
      const res = await fetch('/api/users/me/password', {
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

  return {
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
  };
}
