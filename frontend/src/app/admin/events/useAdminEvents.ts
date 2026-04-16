import { useState, useEffect, useCallback } from 'react';
import { adminEventAPI, adminCategoryAPI, AdminEventListItem } from '@/lib/admin-api';
import { useUIStore } from '@/store/useUIStore';
import { useRouter } from 'next/navigation';

export function useAdminEvents() {
  const router = useRouter();
  const { showToast } = useUIStore();

  // ── 필터 및 검색 상태 ──
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── 데이터 상태 ──
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // ── 팝오버 및 모달 상태 ──
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: 0, title: '' });
  const [hideModal, setHideModal] = useState({ isOpen: false, eventId: 0 });

  /* ── 1. 디바운스 처리 ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1); // 검색어 변경 시 페이지 초기화
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  /* ── 2. 초기 데이터 가져오기 (카테고리 목록) ── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminCategoryAPI.getList();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  /* ── 3. 데이터 가져오기 ── */
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminEventAPI.getEvents({
        status: activeTab === 'ALL' ? undefined : activeTab,
        categoryId: selectedCategoryId || undefined,
        keyword: debouncedKeyword || undefined,
        isHidden: showHiddenOnly || undefined,
        page: currentPage - 1,
        size: 6,
      });

      if (response.success) {
        setEvents(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showToast('강의 목록을 가져오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedCategoryId, debouncedKeyword, showHiddenOnly, currentPage, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* ── 4. 액션 핸들러 ── */
  const handleToggleVisibility = async (id: number) => {
    try {
      const response = await adminEventAPI.toggleVisibility(id);
      if (response.success) {
        showToast('노출 상태가 변경되었습니다.', 'success');
        fetchEvents();
      }
    } catch (error) {
      showToast('상태 변경에 실패했습니다.', 'error');
    }
  };

  const handleDeleteClick = (event: AdminEventListItem) => {
    setDeleteModal({ isOpen: true, eventId: event.id, title: event.title });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await adminEventAPI.deleteEvent(deleteModal.eventId);
      if (response.success) {
        showToast('강의가 삭제되었습니다.', 'success');
        setDeleteModal({ ...deleteModal, isOpen: false });
        fetchEvents();
      }
    } catch (error) {
      showToast('강의 삭제에 실패했습니다.', 'error');
    }
  };

  const handlePopoverSelect = (value: string, event: AdminEventListItem) => {
    if (value === 'delete') {
      handleDeleteClick(event);
    } else if (value === 'hide') {
      if (event.isHidden) {
        handleToggleVisibility(event.id); // 노출 전환은 바로 처리
      } else {
        setHideModal({ isOpen: true, eventId: event.id }); // 숨김 처리 시에만 모달
      }
    } else if (value === 'edit') {
      router.push(`/events/${event.id}`);
    }
  };

  return {
    state: {
      activeTab,
      selectedCategoryId,
      categories,
      searchKeyword,
      showHiddenOnly,
      currentPage,
      events,
      totalPages,
      isLoading,
      openPopoverId,
      deleteModal,
      hideModal,
    },
    actions: {
      setActiveTab,
      setSelectedCategoryId,
      setSearchKeyword,
      setShowHiddenOnly,
      setCurrentPage,
      setOpenPopoverId,
      setDeleteModal,
      setHideModal,
      handleToggleVisibility,
      handleDeleteClick,
      handleConfirmDelete,
      handlePopoverSelect,
      fetchEvents,
    }
  };
}
