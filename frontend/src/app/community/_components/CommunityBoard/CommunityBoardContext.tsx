import React, { createContext, useContext } from 'react';
import { useCommunityPosts } from './_components/PostListSection/useCommunityPosts';
import { useCommunityComments } from './_components/PostDetailSection/useCommunityComments';
import { useAuth } from '@/store/useAuthStore';

type PostsData = ReturnType<typeof useCommunityPosts>;
type CommentsData = ReturnType<typeof useCommunityComments>;

interface CommunityBoardContextValue extends PostsData, CommentsData {
  communityId: string;
  canManage: boolean;
  canWrite: boolean;
  isLoggedIn: boolean;
}

const CommunityBoardContext = createContext<CommunityBoardContextValue | undefined>(undefined);

export function CommunityBoardProvider({ 
  children, 
  communityId, 
  canManage, 
  canWrite 
}: { 
  children: React.ReactNode; 
  communityId: string; 
  canManage: boolean; 
  canWrite: boolean; 
}) {
  const { isLoggedIn } = useAuth();
  const postsData = useCommunityPosts({ communityId });
  const commentsData = useCommunityComments({ selectedPostId: postsData.selectedPostId });

  return (
    <CommunityBoardContext.Provider value={{
      ...postsData,
      ...commentsData,
      communityId,
      canManage,
      canWrite,
      isLoggedIn
    }}>
      {children}
    </CommunityBoardContext.Provider>
  );
}

export function useCommunityBoard() {
  const context = useContext(CommunityBoardContext);
  if (context === undefined) {
    throw new Error('useCommunityBoard must be used within a CommunityBoardProvider');
  }
  return context;
}
