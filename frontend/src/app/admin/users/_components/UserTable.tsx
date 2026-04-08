'use client';

import React from 'react';
import styles from './UserTable.module.css';
import { MoreIcon } from '@/components/icons';
import type { AdminUserListItem } from '@/lib/admin-api';

interface UserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
  onDeleteClick: (user: AdminUserListItem) => void;
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

export default function UserTable({ users, isLoading, onViewDetail, onDeleteClick }: UserTableProps) {
  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (users.length === 0) {
    return <div className={styles.empty}>검색 결과가 없습니다.</div>;
  }

  // 주최자 관리/수강생 관리에 따라 헤더가 다를 수 있지만, 
  // 요청하신 디자인 사양(이미지) 기준으로 주최자 헤더를 구현합니다.
  const isHostView = users.length > 0 && users[0].role === 'HOST';

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
            <tr key={user.id}>
              <td className={styles.hostCol}>
                <div className={styles.userProfile}>
                  <div className={styles.avatar}></div>
                  <span className={styles.userName}>{user.nickname}</span>
                </div>
              </td>
              <td className={styles.managerCol}>
                {/* 담당자명이 별도로 없으므로 닉네임을 활용하거나 더미 데이터를 표시합니다. */}
                {user.nickname}
              </td>
              <td className={styles.bizNumCol}>
                {/* 사업자 번호가 별도로 없으므로 수강생인 경우 이메일을, 호스트인 경우 더미를 표시합니다. */}
                {user.role === 'HOST' ? '000-00-00000' : user.email}
              </td>
              <td className={styles.dateCol}>
                {formatDate(user.createdAt)}
              </td>
              <td className={styles.statusCol}>
                <span className={styles.statusBadge}>
                  {user.active ? '활성' : '승인 대기'}
                </span>
              </td>
              <td className={styles.actionCol}>
                <button 
                  className={styles.moreButton}
                  onClick={() => onViewDetail(user.id)}
                >
                  <MoreIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
