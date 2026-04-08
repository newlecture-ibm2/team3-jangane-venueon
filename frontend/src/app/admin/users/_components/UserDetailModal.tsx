'use client';

import React, { useState, useEffect } from 'react';
import styles from './UserDetailModal.module.css';
import { ModalOverlay, ModalCard } from '@/components/modal';
import { InputField, Button } from '@/components/ui';
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

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser(userId);
    }
  }, [isOpen, userId]);

  const fetchUser = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await adminUserAPI.getUser(id);
      setUser(res.data);
    } catch (err) {
      console.error('회원 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        {/* 상단바 */}
        <div className={styles.topBar}>
          <div /> {/* Right align placeholder */}
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)' }} onClick={onClose} />
        </div>

        {/* 텍스트 영역 */}
        <div className={styles.textWrapper}>
          <h2 className={styles.title}>사용자 프로필</h2>
        </div>

        {isLoading || !user ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <div className={styles.contentScroll}>
            {/* 프로필 이미지 */}
            <div className={styles.profilePicture}>
               {/* 이미지가 없을 경우 이름의 첫 글자를 보여줌 (UserProfile 참고) */}
               <span style={{ color: 'white', fontWeight: 'bold', fontSize: '32px' }}>
                 {user.nickname ? user.nickname.charAt(0) : 'U'}
               </span>
            </div>

            <div className={styles.fieldsContainer}>
              <div className={styles.fieldBlock}>
                <span className={styles.fieldLabel}>아이디</span>
                <InputField value={user.email} disabled />
              </div>

              {user.role === 'HOST' ? (
                <>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>기관명</span>
                    <InputField value="기관명_데이터_없음" disabled />
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>담당자명</span>
                    <InputField value={user.nickname || '담당자'} disabled />
                  </div>
                  <div className={styles.fieldBlock}>
                    <span className={styles.fieldLabel}>사업자 등록번호</span>
                    <InputField value="000-00-00000" disabled />
                  </div>

                  <div className={styles.hostIntroLayout}>
                    <div className={styles.hostIntroHeader}>
                      <span className={styles.fieldLabel}>호스트 소개</span>
                      <span className={styles.charCount}>0/300</span>
                    </div>
                    <textarea 
                      value="데이터를 넘어 마케팅의 본질을 꿰뚫는 AI 전략 그룹으로 실무 마케터들의 AI 전환(AI Transformation) 가속화 및 실질적 생산성 도구 보급합니다." 
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
                  {/* 이미지에서는 이름까지만 있었습니다 */}
                </>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className={styles.buttonGroup}>
              <Button 
                variant="secondary" 
                style={{ flex: 1, padding: 0 }} 
                onClick={onClose}
              >
                취소
              </Button>
              {user.role === 'HOST' ? (
                <Button 
                  variant="danger" 
                  style={{ flex: 1, padding: 0 }}
                  onClick={() => alert('회원 삭제 기능은 아직 구현되지 않았습니다.')}
                >
                  회원 삭제
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  style={{ flex: 1, padding: 0 }}
                  onClick={() => alert('변경 사항 저장 기능은 아직 구현되지 않았습니다.')}
                >
                  변경 사항 저장
                </Button>
              )}
            </div>
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}
