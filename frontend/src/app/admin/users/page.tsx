'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { ConfirmModal } from '@/components/modal';
import { adminUserAPI, type AdminUserListItem } from '@/lib/admin-api';
import UserFilter from './_components/UserFilter';
import UserTable from './_components/UserTable';
import UserDetailModal from './_components/UserDetailModal';

export default function AdminUsersPage() {
  // ── 검색/필터 상태 ──
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // '', 'true', 'false'
  const [currentPage, setCurrentPage] = useState(1);

  // ── 데이터 상태 ──
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── 모달 상태 ──
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<AdminUserListItem | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // ── 데이터 패칭 ──
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminUserAPI.getUsers({
        keyword: keyword || undefined,
        role: roleFilter || undefined,
        active: activeFilter || undefined,
        page: String(currentPage - 1), // Spring은 0-indexed
        size: '6',
      });

      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('회원 목록 조회 실패:', err);
      setUsers([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, roleFilter, activeFilter, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── 이벤트 핸들러 ──
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleActiveChange = (value: string) => {
    setActiveFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetail = (id: number) => {
    setDetailUserId(id);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (user: AdminUserListItem) => {
    setDeleteTarget(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminUserAPI.deleteUser(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const handleToggleStatus = (user: AdminUserListItem) => {
    setStatusTarget(user);
    setIsStatusOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    try {
      await adminUserAPI.changeStatus(statusTarget.id, !statusTarget.active);
      setIsStatusOpen(false);
      setStatusTarget(null);
      fetchUsers();
    } catch (err) {
      console.error('상태 변경 실패:', err);
    }
  };

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
