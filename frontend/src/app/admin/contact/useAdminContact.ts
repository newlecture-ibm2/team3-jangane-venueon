import { useState, useEffect, useCallback } from 'react';
import { adminContactAPI, type ContactListItem } from '@/lib/contact-api';

export function useAdminContact() {
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

  return {
    state: {
      keyword,
      categoryFilter,
      statusFilter,
      currentPage,
      contacts,
      totalPages,
      isLoading,
      detailContactId,
      isDetailOpen,
    },
    actions: {
      setKeyword,
      setCurrentPage,
      setIsDetailOpen,
      handleSearch,
      handleCategoryChange,
      handleStatusChange,
      handleViewDetail,
      fetchContacts,
    }
  };
}
