'use client';

import React, { useState, useEffect } from 'react';
import styles from './UserDetailModal.module.css';
import { ModalOverlay, ModalCard } from '@/components/modal';
import { InputField, Button, Tag, Toggle } from '@/components/ui';
import { CancelIcon } from '@/components/icons';
import { adminUserAPI, type AdminUserDetail } from '@/lib/admin-api';

interface UserDetailModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
  onUpdated: () => void; // 수정 후 목록 새로고침 콜백
}

export default function UserDetailModal({ isOpen, userId, onClose, onUpdated }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 수정 폼 상태
  const [editNickname, setEditNickname] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');

  // 모달 열릴 때 데이터 조회
  useEffect(() => {
    if (isOpen && userId) {
      setIsEditing(false);
      fetchUser(userId);
    }
  }, [isOpen, userId]);

  const fetchUser = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await adminUserAPI.getUser(id);
      setUser(res.data);
      setEditNickname(res.data.nickname || '');
      setEditPhone(res.data.phone || '');
      setEditRole(res.data.role || '');
    } catch (err) {
      console.error('회원 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await adminUserAPI.updateUser(user.id, {
        nickname: editNickname,
        phone: editPhone,
        role: editRole,
      });
      setIsEditing(false);
      fetchUser(user.id);
      onUpdated();
    } catch (err) {
      console.error('수정 실패:', err);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      await adminUserAPI.changeStatus(user.id, !user.active);
      fetchUser(user.id);
      onUpdated();
    } catch (err) {
      console.error('상태 변경 실패:', err);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'HOST':  return '주최자';
      default:      return '일반 회원';
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'purple' as const;
      case 'HOST':  return 'green' as const;
      default:      return 'gray' as const;
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>회원 상세</h2>
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)' }} onClick={onClose} />
        </div>

        {isLoading || !user ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <>
            {/* 상태 토글 영역 */}
            <div className={styles.statusRow}>
              <div className={styles.statusLeft}>
                <span className={styles.fieldLabel}>계정 상태</span>
                <Tag variant={user.active ? 'green' : 'red'}>
                  {user.active ? '활성' : '비활성'}
                </Tag>
              </div>
              {user.role !== 'ADMIN' && (
                <Toggle
                  checked={user.active}
                  onChange={handleToggleStatus}
                  label={user.active ? '활성화됨' : '정지됨'}
                />
              )}
            </div>

            {/* 정보 필드 */}
            <div className={styles.fields}>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>ID</span>
                <span className={styles.fieldValue}>{user.id}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>이메일</span>
                <span className={styles.fieldValue}>{user.email}</span>
              </div>

              {isEditing ? (
                <>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>닉네임</span>
                    <InputField
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>전화번호</span>
                    <InputField
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className={styles.editInput}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>닉네임</span>
                    <span className={styles.fieldValue}>{user.nickname}</span>
                  </div>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>전화번호</span>
                    <span className={styles.fieldValue}>{user.phone || '-'}</span>
                  </div>
                </>
              )}

              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>역할</span>
                <Tag variant={getRoleVariant(user.role)}>{getRoleLabel(user.role)}</Tag>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>가입일</span>
                <span className={styles.fieldValue}>{formatDateTime(user.createdAt)}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>최종 수정일</span>
                <span className={styles.fieldValue}>{formatDateTime(user.updatedAt)}</span>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className={styles.buttonGroup}>
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>취소</Button>
                  <Button variant="primary" onClick={handleSave}>저장</Button>
                </>
              ) : (
                <Button variant="outlined" onClick={() => setIsEditing(true)}>수정</Button>
              )}
            </div>
          </>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}
