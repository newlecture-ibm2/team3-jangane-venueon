'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { ConfirmModal } from '@/components/modal';
import UserFilter from './_components/UserFilter/UserFilter';
import UserTable from './_components/UserTable/UserTable';
import UserDetailModal from './_components/UserDetailModal/UserDetailModal';
import { useAdminUsers } from './useAdminUsers';

export default function AdminUsersPage() {
  const { state, actions } = useAdminUsers();

  const {
    keyword,
    roleFilter,
    activeFilter,
    currentPage,
    users,
    totalPages,
    isLoading,
    detailUserId,
    isDetailOpen,
    deleteTarget,
    isDeleteOpen,
    statusTarget,
    isStatusOpen,
  } = state;

  const {
    setKeyword,
    setCurrentPage,
    setIsDetailOpen,
    setIsDeleteOpen,
    setIsStatusOpen,
    handleSearch,
    handleRoleChange,
    handleActiveChange,
    handleViewDetail,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleStatus,
    handleStatusConfirm,
    fetchUsers,
  } = actions;

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />

      <div className="sidebar-content">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>사용자 관리</h1>
        </div>

        <UserFilter
          keyword={keyword}
          role={roleFilter}
          activeStatus={activeFilter}
          onKeywordChange={setKeyword}
          onRoleChange={handleRoleChange}
          onActiveChange={handleActiveChange}
          onSearch={handleSearch}
        />

        <UserTable
          users={users}
          isLoading={isLoading}
          onViewDetail={handleViewDetail}
          onDeleteClick={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 상세/수정 모달 */}
      <UserDetailModal
        isOpen={isDetailOpen}
        userId={detailUserId}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={fetchUsers}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`${deleteTarget?.nickname || ''} 회원을 삭제하시겠습니까?`}
        subtitle="삭제된 회원 정보는 복구할 수 없습니다."
        status="danger"
        requireCheckbox
        checkboxLabel="위 내용을 확인했습니다."
        confirmText="삭제"
      />

      {/* 상태 변경 확인 모달 */}
      <ConfirmModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onConfirm={handleStatusConfirm}
        title={`${statusTarget?.nickname || ''} 회원을 ${statusTarget?.active ? '비활성화' : '활성화'}하시겠습니까?`}
        subtitle={statusTarget?.active
          ? '비활성화 시 해당 회원은 서비스 이용이 제한됩니다.'
          : '활성화 시 해당 회원은 서비스를 정상적으로 이용할 수 있습니다.'
        }
        status={statusTarget?.active ? 'danger' : 'default'}
        confirmText={statusTarget?.active ? '비활성화' : '활성화'}
      />
    </div>
  );
}
