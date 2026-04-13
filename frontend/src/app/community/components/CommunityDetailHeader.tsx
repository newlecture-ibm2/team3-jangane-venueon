'use client';

import React from 'react';
import styles from '../[id]/page.module.css';

interface Props {
  name: string;
  description: string;
}

import { useRouter, useParams } from 'next/navigation';
import EditIcon from '@/components/icons/EditIcon';

export default function CommunityDetailHeader({ name, description }: Props) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => router.push('/community')}>
          <span>←</span> 커뮤니티 목록
        </button>
      </div>

      <div className={styles.header}>
        <div className={styles.badge}>
          커뮤니티
        </div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{name}</h1>
          {id && (
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
