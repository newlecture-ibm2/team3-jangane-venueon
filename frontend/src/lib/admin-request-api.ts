/**
 * 어드민 요청 관리 API — lib/api.ts의 공통 apiFetch 활용
 */
import { apiFetch } from './api';

// ── 타입 정의 ──

export type RequestCategory = 'BUSINESS_LICENSE' | 'HOST_INQUIRY' | 'USER_INQUIRY' | 'OTHER';
export type RequestStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';

export interface AdminRequestListItem {
  id: number;
  requesterId: number;
  requesterNickname: string | null;
  requesterEmail: string | null;
  category: RequestCategory;
  status: RequestStatus;
  title: string;
  hasAttachment: boolean;
  createdAt: string;
  processedAt: string | null;
}

export interface AdminRequestDetail {
  id: number;
  requesterId: number;
  requesterNickname: string | null;
  requesterEmail: string | null;
  category: RequestCategory;
  status: RequestStatus;
  title: string;
  content: string;
  attachmentUrl: string | null;
  adminComment: string | null;
  processedBy: number | null;
  createdAt: string;
  processedAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── 라벨 매핑 ──

export const CATEGORY_LABELS: Record<RequestCategory, string> = {
  BUSINESS_LICENSE: '사업자등록증 확인',
  HOST_INQUIRY: '호스트 문의',
  USER_INQUIRY: '참석자 문의',
  OTHER: '기타',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: '대기 중',
  REVIEWING: '검토 중',
  COMPLETED: '처리 완료',
  REJECTED: '반려',
};

// ── 어드민용 API ──

export const adminRequestAPI = {
  /** 어드민: 요청 목록 조회 */
  getRequests: (params: {
    category?: string;
    status?: string;
    page?: string;
    size?: string;
  }) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    );
    return apiFetch<ApiResponse<PageResponse<AdminRequestListItem>>>('/admin/requests', { params: filtered });
  },

  /** 어드민: 요청 상세 조회 */
  getRequestDetail: (id: number) => {
    return apiFetch<ApiResponse<AdminRequestDetail>>(`/admin/requests/${id}`);
  },

  /** 어드민: 요청 승인 */
  approveRequest: (id: number, comment?: string) => {
    return apiFetch<ApiResponse<AdminRequestDetail>>(`/admin/requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment || null }),
    });
  },

  /** 어드민: 요청 거절 */
  rejectRequest: (id: number, comment: string) => {
    return apiFetch<ApiResponse<AdminRequestDetail>>(`/admin/requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ comment }),
    });
  },
};

// ── 사용자용 API ──

export const userRequestAPI = {
  /** 내 요청 목록 */
  getMyRequests: (params: {
    category?: string;
    status?: string;
    page?: string;
    size?: string;
  }) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    );
    return apiFetch<ApiResponse<PageResponse<AdminRequestListItem>>>('/requests', { params: filtered });
  },

  /** 요청 작성 */
  createRequest: (data: {
    category: RequestCategory;
    title: string;
    content: string;
    attachmentUrl?: string;
  }) => {
    return apiFetch<ApiResponse<AdminRequestDetail>>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 내 요청 상세 */
  getMyRequestDetail: (id: number) => {
    return apiFetch<ApiResponse<AdminRequestDetail>>(`/requests/${id}`);
  },
};
