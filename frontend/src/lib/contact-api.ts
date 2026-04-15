/**
 * 어드민 요청 관리 API — lib/api.ts의 공통 apiFetch 활용
 */
import { apiFetch } from './api';

// ── 타입 정의 ──

export type ContactCategory = 'BUSINESS_LICENSE' | 'HOST_INQUIRY' | 'USER_INQUIRY' | 'PAYMENT' | 'ACCOUNT' | 'SYSTEM_ERROR' | 'OBJECTION' | 'BILLING' | 'EVENT_MANAGEMENT' | 'OTHER';
export type ContactStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface ContactListItem {
  id: number;
  requesterId: number;
  requesterNickname: string | null;
  requesterEmail: string | null;
  requesterProfileImg: string | null;
  category: ContactCategory;
  status: ContactStatus;
  title: string;
  hasAttachment: boolean;
  createdAt: string;
  processedAt: string | null;
}

export interface ContactDetail {
  id: number;
  requesterId: number;
  requesterNickname: string | null;
  requesterEmail: string | null;
  requesterProfileImg: string | null;
  category: ContactCategory;
  status: ContactStatus;
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

export const CATEGORY_LABELS: Record<ContactCategory, string> = {
  BUSINESS_LICENSE: '사업자등록증 확인',
  HOST_INQUIRY: '호스트 문의',
  USER_INQUIRY: '참석자 문의',
  PAYMENT: '결제/환불',
  ACCOUNT: '계정 문제',
  SYSTEM_ERROR: '시스템 오류',
  OBJECTION: '이의 제기',
  BILLING: '정산 문의',
  EVENT_MANAGEMENT: '이벤트 관리',
  OTHER: '기타',
};

export const STATUS_LABELS: Record<ContactStatus, string> = {
  PENDING: '대기 중',
  REVIEWING: '검토 중',
  COMPLETED: '처리 완료',
  REJECTED: '반려',
  CANCELLED: '취소됨',
};

// ── 어드민용 API ──

export const adminContactAPI = {
  /** 어드민: 요청 목록 조회 */
  getContacts: (params: {
    category?: string;
    status?: string;
    page?: string;
    size?: string;
  }) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    );
    console.log("[DEBUG API CALL] getContacts params:", filtered); return apiFetch<ApiResponse<PageResponse<ContactListItem>>>('/admin/contacts', { params: filtered });
  },

  /** 어드민: 요청 상세 조회 */
  getContactDetail: (id: number) => {
    return apiFetch<ApiResponse<ContactDetail>>(`/admin/contacts/${id}`);
  },

  /** 어드민: 요청 승인 */
  approveContact: (id: number, comment?: string) => {
    return apiFetch<ApiResponse<ContactDetail>>(`/admin/contacts/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment || null }),
    });
  },

  /** 어드민: 요청 거절 */
  rejectContact: (id: number, comment: string) => {
    return apiFetch<ApiResponse<ContactDetail>>(`/admin/contacts/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ comment }),
    });
  },
};

// ── 사용자용 API ──

export const userContactAPI = {
  /** 내 요청 목록 */
  getMyContacts: (params: {
    category?: string;
    status?: string;
    page?: string;
    size?: string;
  }) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    );
    console.log("[DEBUG API CALL] getContacts params:", filtered); return apiFetch<ApiResponse<PageResponse<ContactListItem>>>('/contacts', { params: filtered });
  },

  /** 요청 작성 */
  createContact: (data: {
    category: ContactCategory;
    title: string;
    content: string;
    attachmentUrl?: string;
  }) => {
    return apiFetch<ApiResponse<ContactDetail>>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 내 요청 상세 */
  getMyContactDetail: (id: number) => {
    return apiFetch<ApiResponse<ContactDetail>>(`/contacts/${id}`);
  },

  /** 내 요청 취소 */
  cancelContact: (id: number) => {
    return apiFetch<ApiResponse<ContactDetail>>(`/contacts/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};
