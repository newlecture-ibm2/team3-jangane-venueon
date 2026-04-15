'use client';

import React, { useState, useEffect } from 'react';
import styles from './UserDetailModal.module.css';
import { ModalOverlay, ModalCard } from '@/components/modal';
import { InputField, Button, Dropdown } from '@/components/ui';
import { CancelIcon } from '@/components/icons';
import { adminUserAPI, type AdminUserDetail } from '@/lib/admin-api';

interface UserDetailModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UserDetailModal({ isOpen, userId, onClose, onUpdated }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 권한 수정을 위한 상태
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('USER');

  useEffect(() => {
    if (isOpen && userId) {
      setIsEditing(false); // 모달 열 때마다 읽기 모드로 초기화
      fetchUser(userId);
    }
  }, [isOpen, userId]);

  const fetchUser = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await adminUserAPI.getUser(id);
      setUser(res.data);
      setSelectedRole(res.data.role?.id === 1 ? 'ADMIN' : res.data.role?.id === 3 ? 'HOST' : 'USER');
    } catch (err) {
      console.error('회원 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!userId || !user) return;
    
    setIsLoading(true);
    try {
      // 권한(role)과 함께 기존 닉네임, 전화번호를 유지하여 전송
      await adminUserAPI.updateUser(userId, {
        nickname: user.nickname,
        role: selectedRole,
        phone: user.phone || undefined
      });
      
      setIsEditing(false);
      onUpdated(); // 목록 새로고침
      onClose();   // 모달 닫기
    } catch (err) {
      console.error('권한 변경 실패:', err);
      alert('권한 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId || !user) return;
    
    if (!confirm(`${user.nickname} 회원을 삭제하시겠습니까?\n삭제된 회원은 로그인 시 '탈퇴한 회원'으로 안내되며, 복구 가능합니다.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await adminUserAPI.deleteUser(userId);
      onUpdated(); // 목록 새로고침
      onClose();   // 모달 닫기
    } catch (err) {
      console.error('회원 삭제 실패:', err);
      alert('회원 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'USER', label: '수강생' },
    { value: 'HOST', label: '주최자' },
    { value: 'ADMIN', label: '관리자' }
  ];

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        {/* 헤더 영역 (배경색 적용) */}
        <div className={styles.modalHeader}>
          <div className={styles.topBar}>
            <div />
            <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)' }} onClick={onClose} />
          </div>
          <div className={styles.textWrapper}>
            <h2 className={styles.title}>사용자 프로필</h2>
          </div>
        </div>

        {isLoading || !user ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <div className={styles.contentScroll}>
            {/* 프로필 이미지 */}
            <div className={styles.profilePicture}>
               <span style={{ color: 'white', fontWeight: 'bold', fontSize: '32px' }}>
                 {user.nickname ? user.nickname.charAt(0) : 'U'}
               </span>
            </div>

            <div className={styles.fieldsContainer}>
              {/* ID 등급 관련 필드 추가 (권한 변경 로직을 위해) */}
              <div className={styles.fieldBlock} style={{ zIndex: 10 }}> 
                <span className={styles.fieldLabel}>권한 (Role)</span>
                {isEditing ? (
                  <Dropdown 
                    options={roleOptions} 
                    value={selectedRole} 
                    onChange={setSelectedRole} 
                  />
                ) : (
                  <InputField 
                    value={selectedRole === 'HOST' ? '주최자' : selectedRole === 'ADMIN' ? '관리자' : '수강생'} 
                    disabled 
                  />
                )}
              </div>

              <div className={styles.fieldBlock}>
                <span className={styles.fieldLabel}>아이디</span>
                <InputField value={user.email} disabled />
              </div>

              {/* 기본 데이터 렌더링은 user.role 기준이거나 selectedRole 기준일 수 있습니다. (여기선 기존 Role 유지) */}
              {user.role?.id === 3 ? (
                <>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>기관명</span>
                    <InputField value={user.orgName || '기관명 정보 없음'} disabled />
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>담당자명</span>
                    <InputField value={user.nickname || '담당자'} disabled />
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>사업자 등록번호</span>
                    <InputField value={user.orgNumber || '000-00-00000'} disabled />
                  </div>

                  <div className={styles.hostIntroLayout}>
                    <div className={styles.hostIntroHeader}>
                      <span className={styles.fieldLabel}>호스트 소개</span>
                      <span className={styles.charCount}>{user.orgDescription?.length || 0}/300</span>
                    </div>
                    <textarea 
                      value={user.orgDescription || '호스트 소개 내용이 없습니다.'} 
                      disabled
                      className={styles.hostIntroTextarea}
                    />
                  </div>
                  
                  <div className={styles.uploadLayout}>
                    <span className={styles.uploadLabel}>사업 등록증 업로드</span>
                    <Button variant="secondary" size="medium">파일 열기</Button>
                  </div>
                </>
              ) : (
                <>
                  {/* 일반 수강생 필드 */}
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>이름</span>
                    <InputField value={user.nickname || ''} disabled />
                  </div>
                </>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className={styles.buttonGroup}>
              {isEditing ? (
                <div className={styles.buttonRow}>
                  <Button 
                    variant="secondary" 
                    style={{ flex: 1, padding: 0 }} 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedRole(user.role?.id === 1 ? 'ADMIN' : user.role?.id === 3 ? 'HOST' : 'USER'); // 취소 시 롤백
                    }}
                  >
                    수정 취소
                  </Button>
                  <Button 
                    variant="primary" 
                    style={{ flex: 1, padding: 0 }}
                    onClick={handleUpdateRole}
                  >
                    저장
                  </Button>
                </div>
              ) : (
                <>
                  <div className={styles.buttonRow}>
                    <Button 
                      variant="danger" 
                      style={{ flex: 1, padding: 0 }}
                      onClick={handleDeleteUser}
                    >
                      회원 삭제
                    </Button>
                    <Button 
                      variant="primary" 
                      style={{ flex: 1, padding: 0 }}
                      onClick={() => setIsEditing(true)}
                    >
                      프로필 수정
                    </Button>
                  </div>
                  <div className={styles.buttonRow}>
                    <Button 
                      variant="secondary" 
                      style={{ flex: 1, padding: 0 }} 
                      onClick={onClose}
                    >
                      닫기
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}
