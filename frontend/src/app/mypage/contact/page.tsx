'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination, Button, Table, TableHeader, TableRow, TableCell, Tabs, InputField } from '@/components/ui';
import StatusTag from '@/components/ui/StatusTag';
import { ContactModal, ContactDetailModal } from '@/components/modal';
import { CATEGORY_LABELS } from '@/lib/contact-api';
import { useContact } from './useContact';

/** 날짜 포맷 (YYYY.MM.DD) */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function UserContactPage() {
  const {
    currentPage,
    setCurrentPage,
    contacts,
    totalPages,
    isLoading,
    keyword,
    setKeyword,
    statusFilter,
    isContactOpen,
    setIsContactOpen,
    isDetailOpen,
    setIsDetailOpen,
    detailContactId,
    fetchContacts,
    handleViewDetail,
    handleContactSubmit,
    handleStatusFilterChange,
  } = useContact();

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
                    onChange={handleStatusFilterChange}
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
