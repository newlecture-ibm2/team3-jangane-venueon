import React from 'react';
import { Tag } from '@/components/ui';

export type TagDomain = 'report' | 'course' | 'payment' | 'recruitment';

interface StatusTagProps {
  domain: TagDomain;
  status: any; // Can be string (code/label) or object {id, label}
  className?: string;
}

// 1. 신고 관련 뱃지
const REPORT_MAP: Record<string, { variant: 'red' | 'purple' | 'green' | 'gray', label: string }> = {
  'PENDING': { variant: 'red', label: '대기 중' },
  '대기 중': { variant: 'red', label: '대기 중' },
  'REVIEWING': { variant: 'purple', label: '검토 중' },
  '검토 중': { variant: 'purple', label: '검토 중' },
  'COMPLETED': { variant: 'green', label: '처리 완료' },
  '처리 완료': { variant: 'green', label: '처리 완료' },
  'REJECTED': { variant: 'gray', label: '반려' },
  '반려': { variant: 'gray', label: '반려' },
  'CANCELLED': { variant: 'gray', label: '취소됨' },
  '취소됨': { variant: 'gray', label: '취소됨' },
  'REPORTED_POST': { variant: 'red', label: '신고된 게시글' },
  '신고된 게시글': { variant: 'red', label: '신고된 게시글' },
  'HIDDEN': { variant: 'purple', label: '숨김 처리됨' },
  '숨김 처리됨': { variant: 'purple', label: '숨김 처리됨' },
};

// 2. 세션 상태 뱃지 (세션 카드 사용)
const COURSE_MAP: Record<string, { variant: 'red' | 'purple' | 'green' | 'gray', label: string }> = {
  'DRAFT': { variant: 'gray', label: '게시 전' },
  '게시 전': { variant: 'gray', label: '게시 전' },
  'PUBLISHED': { variant: 'green', label: '게시됨' },
  '게시됨': { variant: 'green', label: '게시됨' },
  'PREPARING': { variant: 'gray', label: '준비 중' },
  '준비 중': { variant: 'gray', label: '준비 중' },
  'ONGOING': { variant: 'purple', label: '진행 중' },
  '진행 중': { variant: 'purple', label: '진행 중' },
  'ENDED': { variant: 'gray', label: '종료' },
  '종료': { variant: 'gray', label: '종료' },
  'CANCELLED': { variant: 'red', label: '취소' },
  '취소': { variant: 'red', label: '취소' },
};

// 4. 모집 상태 뱃지
const RECRUITMENT_MAP: Record<string, { variant: 'red' | 'purple' | 'green' | 'gray', label: string }> = {
  'OPEN': { variant: 'green', label: '모집중' },
  '모집중': { variant: 'green', label: '모집중' },
  'PENDING': { variant: 'gray', label: '모집 대기' },
  '모집 대기': { variant: 'gray', label: '모집 대기' },
  'CLOSED': { variant: 'red', label: '모집 마감' },
  '모집 마감': { variant: 'red', label: '모집 마감' },
};

// 3. 결제 / 수강생 관리 뱃지 (관리자, 주최자 테이블 & 마이페이지 결제 내역)
const PAYMENT_MAP: Record<string, { variant: 'red' | 'purple' | 'green' | 'gray', label: string }> = {
  'APPROVAL_WAITING': { variant: 'red', label: '승인 대기' },
  '승인 대기': { variant: 'red', label: '승인 대기' },
  'PENDING': { variant: 'red', label: '승인 대기' }, // PENDING 백엔드 맵핑
  'APPROVAL_COMPLETED': { variant: 'green', label: '승인 완료' },
  '승인 완료': { variant: 'green', label: '승인 완료' },
  'CANCELLED': { variant: 'gray', label: '취소됨' },
  '취소됨': { variant: 'gray', label: '취소됨' },
  'REFUND_REQUESTED': { variant: 'purple', label: '환불 대기' },
  '환불 대기': { variant: 'purple', label: '환불 대기' },
  'PAID': { variant: 'green', label: '결제 완료' },
  'REGISTERED': { variant: 'green', label: '결제 완료' }, // OrderService REGISTERED = PAID
  '결제 완료': { variant: 'green', label: '결제 완료' },
  'REFUNDED': { variant: 'gray', label: '환불 완료' },
  '환불 완료': { variant: 'gray', label: '환불 완료' },
};

export default function StatusTag({ domain, status, className }: StatusTagProps) {
  let map;
  if (domain === 'report') map = REPORT_MAP;
  else if (domain === 'course') map = COURSE_MAP;
  else if (domain === 'payment') map = PAYMENT_MAP;
  else if (domain === 'recruitment') map = RECRUITMENT_MAP;
  else map = COURSE_MAP; // 기본 폴백

  // status가 객체인 경우 label을 추출하고, 없으면 코드로 취급
  const statusStr = (status && typeof status === 'object') ? (status.label || status.code || '') : String(status || '');
  
  // 매핑 테이블에 없는 status가 들어오면 텍스트 그대로 Gray 태그로 노출
  const config = map[statusStr] || { variant: 'gray', label: statusStr };

  return (
    <Tag variant={config.variant} className={className}>
      {config.label}
    </Tag>
  );
}
