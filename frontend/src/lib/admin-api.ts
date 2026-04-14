/**
 * 어드민 회원 관리 API — lib/api.ts의 공통 apiFetch 활용
 */
import { api } from './api';

// ── 타입 정의 ──

export interface AdminUserListItem {
  id: number;
  email: string;
  nickname: string;
  role: { id: number; label: string };
  active: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  id: number;
  email: string;
  nickname: string;
  role: { id: number; label: string };
  phone: string | null;
  profileImg: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // 호스트 전용
  orgName?: string;
  orgNumber?: string;
  orgDescription?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // 현재 페이지 (0-indexed)
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AdminUpdateUserRequest {
  nickname?: string;
  role?: string;
  phone?: string;
}

export interface AdminReportListItem {
  id: number;
  reporterId: number;
  reporterNickname: string;
  targetType: 'EVENT' | 'POST' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
  detail: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminAction: string | null;
  createdAt: string;
  resolvedAt: string | null;
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
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'role') {
        if (value !== undefined && value !== '') cleanParams['roleId'] = String(value);
      } else if (value !== undefined && value !== '') {
        cleanParams[key] = String(value);
      }
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

export const adminReportAPI = {
  /** 신고 목록 조회 */
  getReports: (params: {
    status?: string;
    targetType?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') cleanParams[key] = String(value);
    });
    return api.get<ApiResponse<PageResponse<AdminReportListItem>>>('/admin/reports', { params: cleanParams });
  },

  /** 신고 처리 */
  processReport: (id: number, action: string, status: string) =>
    api.patch<ApiResponse<void>>(`/admin/reports/${id}`, { action, status }),
};
