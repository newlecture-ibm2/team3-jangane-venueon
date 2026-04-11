'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { type AdminRequestListItem, type AdminRequestDetail } from '@/lib/admin-request-api';
import RequestFilter from './_components/RequestFilter';
import RequestTable from './_components/RequestTable';
import RequestDetailModal from './_components/RequestDetailModal';

// ── 더미 데이터 (API 연동 전 UI 확인용, 나중에 제거) ──
const DUMMY_REQUESTS: AdminRequestListItem[] = [
  {
    id: 1,
    requesterId: 10,
    requesterNickname: '김민수',
    requesterEmail: 'minsu@example.com',
    category: 'BUSINESS_LICENSE',
    status: 'PENDING',
    title: '[가입 심사] 테크캠프',
    hasAttachment: true,
    createdAt: '2026-04-10T09:30:00',
    processedAt: null,
  },
  {
    id: 2,
    requesterId: 11,
    requesterNickname: '이지은',
    requesterEmail: 'jieun@example.com',
    category: 'USER_INQUIRY',
    status: 'PENDING',
    title: '결제 후 수강 목록에 표시되지 않는 문제',
    hasAttachment: false,
    createdAt: '2026-04-09T14:20:00',
    processedAt: null,
  },
  {
    id: 4,
    requesterId: 13,
    requesterNickname: '최서연',
    requesterEmail: 'seoyeon@example.com',
    category: 'HOST_INQUIRY',
    status: 'REJECTED',
    title: '커뮤니티 개설 조건에 대해 문의합니다',
    hasAttachment: false,
    createdAt: '2026-04-07T16:45:00',
    processedAt: '2026-04-08T09:30:00',
  },
  {
    id: 5,
    requesterId: 14,
    requesterNickname: '정도윤',
    requesterEmail: 'doyoon@example.com',
    category: 'HOST_INQUIRY',
    status: 'PENDING',
    title: '사업자등록증 재업로드 요청',
    hasAttachment: true,
    createdAt: '2026-04-11T08:15:00',
    processedAt: null,
  },
  {
    id: 6,
    requesterId: 15,
    requesterNickname: null,
    requesterEmail: 'guest@example.com',
    category: 'OTHER',
    status: 'COMPLETED',
    title: '계정 이메일 변경 요청',
    hasAttachment: false,
    createdAt: '2026-04-06T13:00:00',
    processedAt: '2026-04-07T11:20:00',
  },
  {
    id: 7,
    requesterId: 16,
    requesterNickname: '한소희',
    requesterEmail: 'sohee@example.com',
    category: 'USER_INQUIRY',
    status: 'PENDING',
    title: '이벤트 썸네일 이미지가 깨져서 표시됩니다',
    hasAttachment: true,
    createdAt: '2026-04-11T10:30:00',
    processedAt: null,
  },
];

const DUMMY_DETAIL: Record<number, AdminRequestDetail> = {
  1: {
    id: 1,
    requesterId: 10,
    requesterNickname: '김민수',
    requesterEmail: 'minsu@example.com',
    category: 'BUSINESS_LICENSE',
    status: 'PENDING',
    title: '사업자등록증 확인 요청드립니다',
    content: '안녕하세요. 호스트 등록을 위해 사업자등록증을 첨부했습니다.\n확인 후 승인 부탁드립니다.\n\n사업자번호: 123-45-67890\n상호명: 테크캠프',
    attachmentUrl: '/upload/business_license_sample.pdf',
    adminComment: null,
    processedBy: null,
    createdAt: '2026-04-10T09:30:00',
    processedAt: null,
  },
  2: {
    id: 2,
    requesterId: 11,
    requesterNickname: '이지은',
    requesterEmail: 'jieun@example.com',
    category: 'USER_INQUIRY',
    status: 'PENDING',
    title: '결제 후 수강 목록에 표시되지 않는 문제',
    content: '4월 9일에 "Spring Boot 마스터 클래스" 이벤트를 결제했는데,\n마이페이지 > 내 세션 목록에 나타나지 않습니다.\n\n주문번호: venueon_order_245_1680000000\n결제 금액: 85,000원',
    attachmentUrl: null,
    adminComment: null,
    processedBy: null,
    createdAt: '2026-04-09T14:20:00',
    processedAt: null,
  },
  4: {
    id: 4,
    requesterId: 13,
    requesterNickname: '최서연',
    requesterEmail: 'seoyeon@example.com',
    category: 'HOST_INQUIRY',
    status: 'REJECTED',
    title: '커뮤니티 개설 조건에 대해 문의합니다',
    content: '커뮤니티 개설을 하고 싶은데, 뱃지 보유 조건이 필수인가요?\n뱃지 없이도 개설할 수 있는 방법이 있을까요?',
    attachmentUrl: null,
    adminComment: '현재 커뮤니티 개설은 관련 이벤트 뱃지 보유자만 가능합니다. 먼저 이벤트에 참여해주세요.',
    processedBy: 1,
    createdAt: '2026-04-07T16:45:00',
    processedAt: '2026-04-08T09:30:00',
  },
};
// ── 더미 데이터 끝 ──

export default function AdminRequestsPage() {
  // ── 필터 상태 ──
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── 데이터 상태 ──
  const [requests, setRequests] = useState<AdminRequestListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── 모달 상태 ──
  const [detailRequestId, setDetailRequestId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── 데이터 패칭 (더미 데이터 사용) ──
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);

    // TODO: API 연동 시 아래 더미 로직을 adminRequestAPI.getRequests()로 교체
    await new Promise((r) => setTimeout(r, 300)); // 로딩 시뮬레이션

    let filtered = [...DUMMY_REQUESTS];
    if (keyword) {
      filtered = filtered.filter(
        (r) => r.title.includes(keyword) || (r.requesterNickname && r.requesterNickname.includes(keyword))
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    const pageSize = 20;
    const start = (currentPage - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    setRequests(paged);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setIsLoading(false);
  }, [keyword, categoryFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── 이벤트 핸들러 ──
  const handleSearch = () => {
    setCurrentPage(1);
    fetchRequests();
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetail = (id: number) => {
    setDetailRequestId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>요청 관리</h1>

          <div className={styles.tableSection}>
            <RequestFilter
              keyword={keyword}
              category={categoryFilter}
              status={statusFilter}
              onKeywordChange={setKeyword}
              onSearch={handleSearch}
              onCategoryChange={handleCategoryChange}
              onStatusChange={handleStatusChange}
            />

            <RequestTable
              requests={requests}
              isLoading={isLoading}
              onViewDetail={handleViewDetail}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* 상세/처리 모달 */}
      <RequestDetailModal
        isOpen={isDetailOpen}
        requestId={detailRequestId}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={fetchRequests}
      />
    </div>
  );
}
