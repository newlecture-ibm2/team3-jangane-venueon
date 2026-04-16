'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { ConfirmModal } from '@/components/modal';
import ContactFilter from './_components/ContactFilter/ContactFilter';
import ContactTable from './_components/ContactTable/ContactTable';
import { ContactDetailModal } from '@/components/modal';
import { useAdminContact } from './useAdminContact';

export default function AdminContactPage() {
  const { state, actions } = useAdminContact();

  const {
    keyword,
    categoryFilter,
    statusFilter,
    currentPage,
    contacts,
    totalPages,
    isLoading,
    detailContactId,
    isDetailOpen,
  } = state;

  const {
    setKeyword,
    setCurrentPage,
    setIsDetailOpen,
    handleSearch,
    handleCategoryChange,
    handleStatusChange,
    handleViewDetail,
    fetchContacts,
  } = actions;

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
