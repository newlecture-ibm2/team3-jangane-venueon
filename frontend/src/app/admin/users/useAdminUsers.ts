import { useState, useEffect, useCallback } from 'react';
import { adminUserAPI, type AdminUserListItem } from '@/lib/admin-api';

export function useAdminUsers() {
  // ── 검색/필터 상태 ──
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('3');
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

  return {
    state: {
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
    },
    actions: {
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
    }
  };
}
