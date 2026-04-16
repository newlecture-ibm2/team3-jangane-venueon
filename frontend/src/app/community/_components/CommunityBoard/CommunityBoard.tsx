'use client';

import React, { createContext, useContext } from 'react';
import { useCommunityPosts } from './useCommunityPosts';
import { useCommunityComments } from './useCommunityComments';
import { PostListSection } from './_components/PostListSection/PostListSection';
import { PostDetailSection } from './_components/PostDetailSection/PostDetailSection';
import styles from './CommunityBoard.module.css';

type PostsData = ReturnType<typeof useCommunityPosts>;
type CommentsData = ReturnType<typeof useCommunityComments>;

interface CommunityBoardContextValue extends PostsData, CommentsData {
  communityId: string;
  canManage: boolean;
  canWrite: boolean;
  isLoggedIn: boolean;
}

const CommunityBoardContext = createContext<CommunityBoardContextValue | undefined>(undefined);

export function useCommunityBoard() {
  const context = useContext(CommunityBoardContext);
  if (context === undefined) {
    throw new Error('useCommunityBoard must be used within a CommunityBoard Provider');
  }
  return context;
}

interface Props {
  communityId: string;
  canManage: boolean;
  canWrite: boolean;
  isLoggedIn: boolean;
}

export default function CommunityBoard({ communityId, canManage, canWrite, isLoggedIn }: Props) {
  const postsData = useCommunityPosts({ communityId });
  const commentsData = useCommunityComments({ selectedPostId: postsData.selectedPostId });

  const contextValue = {
    ...postsData,
    ...commentsData,
    communityId,
    canManage,
    canWrite,
    isLoggedIn
  };

  return (
    <CommunityBoardContext.Provider value={contextValue}>
      <div className={styles.container}>
        <PostListSection />
        <PostDetailSection />
      </div>
    </CommunityBoardContext.Provider>
  );
}
