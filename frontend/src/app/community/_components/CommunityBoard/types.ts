export interface PostListResponse {
  id: number;
  title: string;
  type: string;
  authorId: number;
  authorNickname: string;
  content: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isBookmarked: boolean;
  isPinned: boolean;
  isNotice: boolean;
  createdAt: string;
}

export interface CommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  parentId: number | null;
  likeCount: number;
  createdAt: string;
}

export interface PageData {
  content: PostListResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
}
