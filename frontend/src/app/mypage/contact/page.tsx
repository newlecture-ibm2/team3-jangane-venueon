'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination, Button, Table, TableHeader, TableRow, TableCell, Tabs, InputField } from '@/components/ui';
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

/** ContactModal 카테고리 값은 백엔드 ContactCategory와 동일 */

export default function UserContactPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── 필터 상태 ──
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 모달 상태
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<number | null>(null);

  const { showToast } = useUIStore();

  // ── 데이터 패칭 ──
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userContactAPI.getMyContacts({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        page: String(currentPage - 1),
        size: '20',
      });
      setContacts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      showToast('문의 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, categoryFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleViewDetail = (id: number) => {
    setDetailContactId(id);
    setIsDetailOpen(true);
  };

  const handleContactSubmit = async (data: {
    category: string;
    title: string;
    content: string;
    attachments?: File[];
  }) => {
    try {
      let attachmentUrl: string | undefined;

      // 첨부파일이 있으면 각각 업로드 후 URL 합치기
      if (data.attachments && data.attachments.length > 0) {
        const uploadPromises = data.attachments.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            return uploadData.data?.filePath || uploadData.data;
          }
          return null;
        });
        
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url) => url != null);
        if (validUrls.length > 0) {
          attachmentUrl = validUrls.join(',');
        }
      }

      await userContactAPI.createContact({
        category: data.category as ContactCategory,
        title: data.title,
        content: data.content,
        attachmentUrl,
      });
      showToast('문의가 접수되었습니다.', 'success');
      setIsContactOpen(false);
      fetchContacts();
    } catch (error) {
      console.error('Failed to create contact:', error);
      showToast('문의 접수에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>1:1 문의</h1>
            <Button variant="primary" onClick={() => setIsContactOpen(true)}>
              문의하기
            </Button>
          </div>

          <div className={styles.tableSection}>
            {/* 필터 영역 */}
            <div className={styles.filterContainer}>

              <div className={styles.searchFilterArea}>
                <InputField
                  variant="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
                  className={styles.searchComponent}
                />
                <div className={styles.buttonArea}>
                  <Tabs
                    variant="pill"
                    options={[
                      { value: '', label: '전체' },
                      { value: 'PENDING', label: '대기 중' },
                      { value: 'REVIEWING', label: '검토 중' },
                      { value: 'COMPLETED', label: '처리 완료' },
                    ]}
                    activeValue={statusFilter}
                    onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={styles.emptyState}>데이터를 불러오는 중...</div>
            ) : contacts.length === 0 ? (
              <div className={styles.emptyState}>문의 내역이 없습니다.</div>
            ) : (
              <Table columns="1fr 120px 120px 100px">
                <TableHeader>
                  <TableCell header>제목</TableCell>
                  <TableCell header>카테고리</TableCell>
                  <TableCell header>문의일</TableCell>
                  <TableCell header>상태</TableCell>
                </TableHeader>

                {contacts.map((req) => (
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
        role="user"
        onSubmit={handleContactSubmit}
      />

      {/* 문의 상세 모달 */}
      <ContactDetailModal
        isOpen={isDetailOpen}
        contactId={detailContactId}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={fetchContacts}
      />
    </div>
  );
}
