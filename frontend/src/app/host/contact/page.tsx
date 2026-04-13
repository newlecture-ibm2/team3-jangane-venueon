'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination, Button, Table, TableHeader, TableRow, TableCell } from '@/components/ui';
import StatusTag from '@/components/ui/StatusTag';
import { ContactModal, ContactDetailModal } from '@/components/modal';
import { useUIStore } from '@/store/useUIStore';
import {
  userContactAPI,
  CATEGORY_LABELS,
  type ContactListItem,
  type ContactCategory,
} from '@/lib/contact-api';

/** 날짜 포맷 (YYYY.MM.DD) */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** ContactModal 카테고리 → 백엔드 ContactCategory 매핑 */
function mapCategoryToBackend(category: string): ContactCategory {
  if (category === 'auth') return 'BUSINESS_LICENSE';
  if (category === 'etc') return 'OTHER';
  return 'HOST_INQUIRY';
}

export default function HostContactPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<ContactListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 모달 상태
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailRequestId, setDetailRequestId] = useState<number | null>(null);

  const { showToast } = useUIStore();

  // ── 데이터 패칭 ──
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userContactAPI.getMyRequests({
        page: String(currentPage - 1),
        size: '20',
      });
      setRequests(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      showToast('문의 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewDetail = (id: number) => {
    setDetailRequestId(id);
    setIsDetailOpen(true);
  };

  const handleContactSubmit = async (data: {
    category: string;
    title: string;
    content: string;
    attachment?: File | null;
  }) => {
    try {
      await userContactAPI.createRequest({
        category: mapCategoryToBackend(data.category),
        title: data.title,
        content: data.content,
        attachmentUrl: undefined, // TODO: 파일 업로드 후 URL 연동
      });
      showToast('문의가 접수되었습니다.', 'success');
      setIsContactOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to create request:', error);
      showToast('문의 접수에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>1:1 문의</h1>
            <Button variant="primary" onClick={() => setIsContactOpen(true)}>
              문의하기
            </Button>
          </div>

          <div className={styles.tableSection}>
            {isLoading ? (
              <div className={styles.emptyState}>데이터를 불러오는 중...</div>
            ) : requests.length === 0 ? (
              <div className={styles.emptyState}>문의 내역이 없습니다.</div>
            ) : (
              <Table columns="1fr 120px 120px 100px">
                <TableHeader>
                  <TableCell header>제목</TableCell>
                  <TableCell header>카테고리</TableCell>
                  <TableCell header>문의일</TableCell>
                  <TableCell header>상태</TableCell>
                </TableHeader>

                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <button className={styles.titleLink} onClick={() => handleViewDetail(req.id)}>
                        {req.title}
                      </button>
                    </TableCell>
                    <TableCell>{CATEGORY_LABELS[req.category]}</TableCell>
                    <TableCell>{formatDate(req.createdAt)}</TableCell>
                    <TableCell>
                      <StatusTag domain="report" status={req.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* 문의 작성 모달 */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        role="host"
        onSubmit={handleContactSubmit}
      />

      {/* 문의 상세 모달 */}
      <ContactDetailModal
        isOpen={isDetailOpen}
        requestId={detailRequestId}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={fetchRequests}
      />
    </div>
  );
}
