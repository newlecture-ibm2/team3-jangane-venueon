'use client';

import React from 'react';
import styles from './ContactTable.module.css';
import { Table, TableHeader, TableRow, TableCell, UserProfile } from '@/components/ui';
import StatusTag from '@/components/ui/StatusTag';
import { CATEGORY_LABELS, type ContactListItem, type ContactCategory, type ContactStatus } from '@/lib/contact-api';

interface ContactTableProps {
  contacts: ContactListItem[];
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

export default function ContactTable({ contacts, isLoading, onViewDetail }: ContactTableProps) {
  if (isLoading) {
    return <div className={styles.emptyState}>데이터를 불러오는 중...</div>;
  }

  if (contacts.length === 0) {
    return <div className={styles.emptyState}>문의 내역이 없습니다.</div>;
  }

  return (
    <Table columns="1fr 120px 120px 100px">
      <TableHeader>
        <TableCell header>제목</TableCell>
        <TableCell header>작성자</TableCell>
        <TableCell header>문의일</TableCell>
        <TableCell header>상태</TableCell>
      </TableHeader>

      {contacts.map((req) => {
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
