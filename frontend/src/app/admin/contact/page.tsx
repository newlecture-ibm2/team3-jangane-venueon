'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { adminContactAPI, type ContactListItem } from '@/lib/contact-api';
import ContactFilter from './_components/ContactFilter';
import ContactTable from './_components/ContactTable';
import { ContactDetailModal } from '@/components/modal';

export default function AdminContactPage() {
  // ── 필터 상태 ──
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── 데이터 상태 ──
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── 모달 상태 ──
  const [detailContactId, setDetailContactId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── 데이터 패칭 ──
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminContactAPI.getContacts({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        page: String(currentPage - 1),
        size: '20',
      });
      setContacts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch admin contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ── 이벤트 핸들러 ──
  const handleSearch = () => {
    setCurrentPage(1);
    fetchContacts();
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
    setDetailContactId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>문의 관리</h1>

          <div className={styles.tableSection}>
            <ContactFilter
              keyword={keyword}
              category={categoryFilter}
              status={statusFilter}
              onKeywordChange={setKeyword}
              onSearch={handleSearch}
              onCategoryChange={handleCategoryChange}
              onStatusChange={handleStatusChange}
            />

            <ContactTable
              contacts={contacts}
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
      <ContactDetailModal
        isOpen={isDetailOpen}
        contactId={detailContactId}
        onClose={() => {
          setIsDetailOpen(false);
          fetchContacts();
        }}
        onUpdated={fetchContacts}
        role="admin"
      />
    </div>
  );
}
