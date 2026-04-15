'use client';

import React from 'react';
import styles from '../../users/_components/UserTable.module.css'; // 어드민 공통 테이블 스타일 재사용
import { Button } from '@/components/ui';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  creatorNickname: string;
  eventName: string | null;
  createdAt: string;
}

interface Props {
  data: CommunityItem[];
  isLoading: boolean;
  onManage: (id: number) => void;
}

export default function AdminCommunityTable({ data, isLoading, onManage }: Props) {
  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  if (data.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>데이터가 없습니다.</div>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '80px' }}>ID</th>
            <th>커뮤니티명</th>
            <th>소속 강의</th>
            <th>생성자</th>
            <th>생성일</th>
            <th style={{ width: '120px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} onClick={() => onManage(item.id)} style={{ cursor: 'pointer' }}>
              <td>{item.id}</td>
              <td style={{ fontWeight: 600 }}>{item.name}</td>
              <td>{item.eventName || '-'}</td>
              <td>{item.creatorNickname}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <Button variant="outlined" onClick={() => onManage(item.id)}>
                  이동
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
