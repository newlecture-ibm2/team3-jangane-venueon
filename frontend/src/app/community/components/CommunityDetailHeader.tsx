'use client';

import React from 'react';
import styles from '../[id]/page.module.css';

interface Props {
  name: string;
  description: string;
}

import { useRouter } from 'next/navigation';

export default function CommunityDetailHeader({ name, description }: Props) {
  const router = useRouter();

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => router.push('/community')}>
          <span>←</span> 커뮤니티 목록
        </button>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        {description && (
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>{description}</p>
        )}
      </div>
    </>
  );
}
