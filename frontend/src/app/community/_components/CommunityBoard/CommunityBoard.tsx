'use client';

import React from 'react';
import { CommunityBoardProvider } from './CommunityBoardContext';
import { PostListSection } from './_components/PostListSection/PostListSection';
import { PostDetailSection } from './_components/PostDetailSection/PostDetailSection';
import styles from './CommunityBoard.module.css';

interface Props {
  communityId: string;
  canManage: boolean;
  canWrite: boolean;
}

export default function CommunityBoard({ communityId, canManage, canWrite }: Props) {
  return (
    <CommunityBoardProvider communityId={communityId} canManage={canManage} canWrite={canWrite}>
      <div className={styles.container}>
        <PostListSection />
        <PostDetailSection />
      </div>
    </CommunityBoardProvider>
  );
}
