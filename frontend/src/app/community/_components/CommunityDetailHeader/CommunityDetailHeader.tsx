'use client';

import React from 'react';
import styles from './CommunityDetailHeader.module.css';

interface Props {
  name: string;
  description: string;
  canManage?: boolean; // 관리 권한 여부 추가
}

import { useRouter, useParams } from 'next/navigation';
import EditIcon from '@/components/icons/EditIcon';

export default function CommunityDetailHeader({ name, description, canManage }: Props) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => router.push('/community')}>
          <span>←</span> 뒤로 가기
        </button>
      </div>

      <div className={styles.header}>
        <div className={styles.badge}>
          커뮤니티
        </div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{name}</h1>
          {id && canManage && ( // canManage 권한이 있을 때만 수정 버튼 노출
            <button
              className={styles.editButtonDetail}
              onClick={() => router.push(`/community/${id}/edit`)}
              title="커뮤니티 정보 수정"
            >
              <EditIcon width={24} height={24} />
            </button>
          )}
        </div>
        {description && (
          <p className={styles.descriptionText}>{description}</p>
        )}
      </div>
    </>
  );
}
