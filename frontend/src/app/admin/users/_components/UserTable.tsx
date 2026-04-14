'use client';

import React, { useState } from 'react';
import styles from './UserTable.module.css';
import { MoreIcon } from '@/components/icons';
import { PopoverMenu } from '@/components/ui';
import type { AdminUserListItem } from '@/lib/admin-api';
import Tag from '@/components/ui/Tag';

interface UserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
  onDeleteClick: (user: AdminUserListItem) => void;
  onToggleStatus: (user: AdminUserListItem) => void;
}

/** 날짜 포맷 */
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const POPOVER_ITEMS = [
  { value: 'edit', label: '편집' },
  { value: 'delete', label: '삭제' },
  { value: 'reject', label: '반려' },
  { value: 'report', label: '경고' },
];

export default function UserTable({ users, isLoading, onViewDetail, onDeleteClick, onToggleStatus }: UserTableProps) {
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (users.length === 0) {
    return <div className={styles.empty}>검색 결과가 없습니다.</div>;
  }

  // 주최자 관리/수강생 관리에 따라 헤더가 다를 수 있지만, 
  // 요청하신 디자인 사양(이미지) 기준으로 주최자 헤더를 구현합니다.
  const isHostView = users.length > 0 && users[0].role?.id === 3;

  const handleMoreClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    setOpenPopoverId(prev => (prev === userId ? null : userId));
  };

  const handlePopoverSelect = (value: string, user: AdminUserListItem) => {
    setOpenPopoverId(null);
    switch (value) {
      case 'edit':
        onViewDetail(user.id);
        break;
      case 'delete':
        onDeleteClick(user);
        break;
      case 'reject':
        // TODO: 반려 로직 연결
        console.log('반려:', user.id);
        break;
      case 'report':
        // TODO: 신고 로직 연결
        console.log('신고:', user.id);
        break;
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.hostCol}>{isHostView ? '호스트' : '사용자'}</th>
            <th className={styles.managerCol}>{isHostView ? '담당자명' : '닉네임'}</th>
            <th className={styles.bizNumCol}>{isHostView ? '사업자 번호' : '이메일'}</th>
            <th className={styles.dateCol}>가입일</th>
            <th className={styles.statusCol}>상태</th>
            <th className={styles.actionCol}></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} onClick={() => onViewDetail(user.id)} style={{ cursor: 'pointer' }}>
              <td className={styles.hostCol}>
                <div className={styles.userProfile}>
                  <div className={styles.avatar}></div>
                  <span className={styles.userName} title={user.nickname}>
                    {user.nickname}
                  </span>
                </div>
              </td>
              <td className={styles.managerCol} title={user.nickname}>
                {user.nickname}
              </td>
              <td className={styles.bizNumCol}>
                {/* 사업자 번호가 별도로 없으므로 수강생인 경우 이메일을, 호스트인 경우 더미를 표시합니다. */}
                {user.role?.id === 3 ? '000-00-00000' : user.email}
              </td>
              <td className={styles.dateCol}>
                {formatDate(user.createdAt)}
              </td>
              <td className={styles.statusCol}>
                <button
                  className={styles.statusToggleBtn}
                  onClick={(e) => { e.stopPropagation(); onToggleStatus(user); }}
                >
                  <Tag variant={user.active ? 'green' : 'red'}>
                    {user.active ? '활성' : '정지'}
                  </Tag>
                </button>
              </td>
              <td className={styles.actionCol}>
                <div
                  className={styles.moreWrapper}
                  onClick={(e) => e.stopPropagation()} /* 행 클릭 이벤트로 전파되지 않도록 차단 */
                  style={{ zIndex: openPopoverId === user.id ? 50 : 1 }}
                >
                  <button
                    className={styles.moreButton}
                    onClick={(e) => handleMoreClick(e, user.id)}
                  >
                    <MoreIcon />
                  </button>
                  {openPopoverId === user.id && (
                    <PopoverMenu
                      items={POPOVER_ITEMS}
                      onSelect={(value) => handlePopoverSelect(value, user)}
                      onClose={() => setOpenPopoverId(null)}
                      width={140}
                      className={styles.popover}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
