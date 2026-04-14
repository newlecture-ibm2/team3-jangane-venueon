'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventActionMenu.module.css';
import { PopoverMenu } from '@/components/ui';
import { ConfirmModal } from '@/components/modal';
import { useAuth } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  eventId: string;
  creatorId: number;
}

export default function EventActionMenu({ eventId, creatorId }: Props) {
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // 현재 유저가 작성자거나 ADMIN인지 확인
  const isAuthorized = user && (user.id === creatorId || user.role?.id === 1);

  if (!isAuthorized) {
    return null;
  }

  const handleSelect = (val: string) => {
    setMenuOpen(false);
    if (val === 'edit') {
      router.push(`/events/${eventId}/edit`);
    } else if (val === 'delete') {
      setModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('이벤트 삭제에 실패했습니다.');

      showToast('이벤트가 성공적으로 삭제되었습니다.', 'success');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.triggerButton} onClick={() => setMenuOpen(!menuOpen)}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {menuOpen && (
        <PopoverMenu
          items={[
            { value: 'edit', label: '수정' },
            { value: 'delete', label: '삭제' },
          ]}
          onSelect={handleSelect}
          onClose={() => setMenuOpen(false)}
          width={120}
          style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 10 }}
        />
      )}

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        title="이벤트 삭제"
        subtitle="정말 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)"
        confirmText="삭제"
        status="danger"
      />
    </div>
  );
}
