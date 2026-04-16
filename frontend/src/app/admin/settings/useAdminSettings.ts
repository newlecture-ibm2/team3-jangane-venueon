import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { adminCategoryAPI, AdminCategoryItem } from '@/lib/admin-api';
import { CategoryFormData } from './_components/CategoryFormModal';

// Auto-scroll 설정값
const AUTO_SCROLL_THRESHOLD = 80;
const AUTO_SCROLL_MAX_SPEED = 15;

export function useAdminSettings() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>({});
  const [sortByEvent, setSortByEvent] = useState(false);

  // 삭제 모달
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // 추가/수정 모달
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Auto-scroll refs
  const autoScrollRafRef = useRef<number | null>(null);
  const mouseYRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  // ── 데이터 패칭 ──
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminCategoryAPI.getList();
      setCategories(res.data);
      setVisibilityMap(prev => {
        const newMap = { ...prev };
        res.data.forEach((c: AdminCategoryItem) => {
          if (newMap[c.id] === undefined) newMap[c.id] = true;
        });
        return newMap;
      });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Auto-scroll 로직 ──
  const autoScrollLoop = useCallback(() => {
    if (!isDraggingRef.current) return;

    const y = mouseYRef.current;
    const vh = window.innerHeight;

    if (y < AUTO_SCROLL_THRESHOLD) {
      const intensity = 1 - (y / AUTO_SCROLL_THRESHOLD);
      window.scrollBy(0, -(intensity * AUTO_SCROLL_MAX_SPEED));
    } else if (y > vh - AUTO_SCROLL_THRESHOLD) {
      const intensity = 1 - ((vh - y) / AUTO_SCROLL_THRESHOLD);
      window.scrollBy(0, intensity * AUTO_SCROLL_MAX_SPEED);
    }

    autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);
  }, []);

  const startAutoScroll = useCallback(() => {
    isDraggingRef.current = true;
    autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);
  }, [autoScrollLoop]);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  // 드래그 중 마우스 위치를 추적하는 전역 이벤트
  useEffect(() => {
    const handleGlobalDrag = (e: DragEvent) => {
      mouseYRef.current = e.clientY;
    };
    window.addEventListener('drag', handleGlobalDrag);
    window.addEventListener('dragover', handleGlobalDrag);
    return () => {
      window.removeEventListener('drag', handleGlobalDrag);
      window.removeEventListener('dragover', handleGlobalDrag);
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  // ── 검색 및 정렬 필터링 ──
  const filteredCategories = useMemo(() => {
    let list = [...categories];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(kw) ||
        (c.description && c.description.toLowerCase().includes(kw))
      );
    }

    if (sortByEvent) {
      list.sort((a, b) => b.eventCount - a.eventCount);
    }

    return list;
  }, [categories, searchKeyword, sortByEvent]);

  // ── 핸들러 ──
  const handleOpenCreate = () => {
    setEditTarget(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: AdminCategoryItem) => {
    setEditTarget(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await adminCategoryAPI.update(editTarget.id, {
          name: data.name,
          description: data.description,
          sortOrder: editTarget.sortOrder,
        });
      } else {
        await adminCategoryAPI.create({
          name: data.name,
          description: data.description,
          sortOrder: categories.length,
        });
      }
      setIsFormOpen(false);
      setEditTarget(null);
      fetchCategories();
    } catch (error) {
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await adminCategoryAPI.delete(deleteTargetId);
      fetchCategories();
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제 실패');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleToggleVisibility = (id: number, visible: boolean) => {
    setVisibilityMap(prev => ({ ...prev, [id]: visible }));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (sortByEvent) return; // 정렬 중 방지
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    mouseYRef.current = e.clientY;
    startAutoScroll();
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (sortByEvent || draggedIndex === null || draggedIndex === index) return;
    const reordered = [...categories];
    const [dragged] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, dragged);
    setDraggedIndex(index);
    setCategories(reordered);
  };

  const handleDragEnd = async () => {
    stopAutoScroll();
    if (draggedIndex === null) return;
    setDraggedIndex(null);
    try {
      await Promise.all(
        categories.map((cat, idx) => adminCategoryAPI.updateOrder(cat.id, idx))
      );
      fetchCategories();
    } catch (error) {
      console.error('Failed to update order:', error);
      fetchCategories();
    }
  };

  return {
    state: {
      isLoading,
      searchKeyword,
      sortByEvent,
      filteredCategories,
      visibilityMap,
      draggedIndex,
      isFormOpen,
      editTarget,
      isSubmitting,
      deleteTargetId,
    },
    actions: {
      setSearchKeyword,
      setSortByEvent,
      setIsFormOpen,
      setEditTarget,
      setDeleteTargetId,
      handleOpenCreate,
      handleOpenEdit,
      handleFormSubmit,
      handleDelete,
      handleToggleVisibility,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
    }
  };
}
