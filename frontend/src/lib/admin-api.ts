/**
 * 어드민 회원 관리 API — lib/api.ts의 공통 apiFetch 활용
 */
import { api } from './api';

// ── 타입 정의 ──

export interface AdminUserListItem {
  id: number;
  email: string;
  nickname: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  id: number;
  email: string;
  nickname: string;
  role: string;
  phone: string | null;
  profileImg: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // 현재 페이지 (0-indexed)
  size: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface AdminUpdateUserRequest {
  nickname?: string;
  role?: string;
  phone?: string;
}

// ── API 함수 ──

export const adminUserAPI = {
  /** 회원 목록 조회 (검색 + 역할 필터 + 페이징) */
  getUsers: (params: {
    keyword?: string;
    role?: string;
    active?: string; // "true" or "false"
    page?: string;
    size?: string;
  }) => {
    // 빈 값 제거
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') cleanParams[key] = String(value);
    });
    return api.get<ApiResponse<PageResponse<AdminUserListItem>>>('/admin/users', { params: cleanParams });
  },

  /** 회원 상세 조회 */
  getUser: (id: number) =>
    api.get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`),

  /** 회원 정보 수정 */
  updateUser: (id: number, body: AdminUpdateUserRequest) =>
    api.put<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`, body),

  /** 회원 활성/비활성 전환 */
  changeStatus: (id: number, active: boolean) =>
    api.patch<ApiResponse<void>>(`/admin/users/${id}/status`, { active }),

  /** 회원 삭제 */
  deleteUser: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/users/${id}`),
};

export interface AdminCategoryItem {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
  eventCount: number;
}

export interface AdminCategoryRequest {
  name: string;
  description: string;
  sortOrder: number;
}

export const adminCategoryAPI = {
  /** 전체 카테고리 목록 조회 (정렬 순) */
  getList: () =>
    api.get<ApiResponse<AdminCategoryItem[]>>('/admin/categories'),

  /** 신규 카테고리 생성 */
  create: (data: AdminCategoryRequest) =>
    api.post<ApiResponse<AdminCategoryItem>>('/admin/categories', data),

  /** 카테고리 정보 수정 */
  update: (id: number, data: AdminCategoryRequest) =>
    api.put<ApiResponse<AdminCategoryItem>>(`/admin/categories/${id}`, data),

  /** 카테고리 삭제 */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/categories/${id}`),

  /** 순서 변경 (PATCH) */
  updateOrder: (id: number, newOrder: number) =>
    api.patch<ApiResponse<void>>(`/admin/categories/${id}/order`, { sortOrder: newOrder }),
};
