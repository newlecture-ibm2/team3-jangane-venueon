'use client';

import React from 'react';
import styles from './RequestTable.module.css';
import { Table, TableHeader, TableRow, TableCell, UserProfile } from '@/components/ui';
import StatusTag from '@/components/ui/StatusTag';
import { CATEGORY_LABELS, type AdminRequestListItem, type RequestCategory, type RequestStatus } from '@/lib/admin-request-api';

interface RequestTableProps {
  requests: AdminRequestListItem[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
}



/** 날짜 포맷 (YYYY-MM-DD) */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function RequestTable({ requests, isLoading, onViewDetail }: RequestTableProps) {
  if (isLoading) {
    return <div className={styles.emptyState}>데이터를 불러오는 중...</div>;
  }

  if (requests.length === 0) {
    return <div className={styles.emptyState}>요청 내역이 없습니다.</div>;
  }

  return (
    <Table columns="1fr 120px 120px 100px">
      <TableHeader>
        <TableCell header>제목</TableCell>
        <TableCell header>요청자</TableCell>
        <TableCell header>요청일</TableCell>
        <TableCell header>상태</TableCell>
      </TableHeader>

      {requests.map((req) => {
        return (
          <TableRow key={req.id}>
            <TableCell>
              <button className={styles.titleLink} onClick={() => onViewDetail(req.id)}>
                {req.title}
              </button>
            </TableCell>
            <TableCell>
              <UserProfile 
                name={req.requesterNickname || req.requesterEmail?.split('@')[0] || '사용자'} 
                size="medium" 
              />
            </TableCell>
            <TableCell>{formatDate(req.createdAt)}</TableCell>
            <TableCell>
              <StatusTag domain="report" status={req.status} />
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}
