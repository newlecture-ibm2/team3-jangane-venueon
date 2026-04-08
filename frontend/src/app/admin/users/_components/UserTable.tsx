'use client';

import React from 'react';
import styles from './UserTable.module.css';
import { Tag, Button } from '@/components/ui';
import type { AdminUserListItem } from '@/lib/admin-api';

interface UserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
  onDeleteClick: (user: AdminUserListItem) => void;
}

/** 역할에 따른 Tag variant 매핑 */
function getRoleTag(role: string) {
  switch (role) {
    case 'ADMIN':
      return { variant: 'purple' as const, label: '관리자' };
    case 'HOST':
      return { variant: 'green' as const, label: '주최자' };
    default:
      return { variant: 'gray' as const, label: '일반 회원' };
  }
}

/** 활성 상태 Tag */
function getStatusTag(active: boolean) {
  return active
    ? { variant: 'green' as const, label: '활성' }
    : { variant: 'red' as const, label: '비활성' };
}

/** 날짜 포맷 */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function UserTable({ users, isLoading, onViewDetail, onDeleteClick }: UserTableProps) {
  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (users.length === 0) {
    return <div className={styles.empty}>검색 결과가 없습니다.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>이메일</th>
            <th>닉네임</th>
            <th>역할</th>
            <th>상태</th>
            <th>가입일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const roleTag = getRoleTag(user.role);
            const statusTag = getStatusTag(user.active);
            return (
              <tr key={user.id}>
                <td className={styles.idCell}>{user.id}</td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>{user.nickname}</td>
                <td>
                  <Tag variant={roleTag.variant}>{roleTag.label}</Tag>
                </td>
                <td>
                  <Tag variant={statusTag.variant}>{statusTag.label}</Tag>
                </td>
                <td className={styles.dateCell}>{formatDate(user.createdAt)}</td>
                <td className={styles.actionCell}>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => onViewDetail(user.id)}
                  >
                    상세
                  </Button>
                  {user.role !== 'ADMIN' && (
                    <Button
                      variant="danger"
                      size="medium"
                      onClick={() => onDeleteClick(user)}
                    >
                      삭제
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
