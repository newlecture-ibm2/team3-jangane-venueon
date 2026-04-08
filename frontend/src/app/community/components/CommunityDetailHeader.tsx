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
        <div className={styles.badge}>
            커뮤니티
        </div>
        <h1 className={styles.title}>{name}</h1>
        {description && (
          <p className={styles.descriptionText}>{description}</p>
        )}
      </div>
    </>
  );
}
