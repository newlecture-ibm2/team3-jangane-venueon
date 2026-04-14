'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { InputField, Button, Pagination } from '@/components/ui';

import { adminCategoryAPI, AdminCategoryItem } from '@/lib/admin-api';
import CategoryItem from './_components/CategoryItem';
import CategoryFormModal, { CategoryFormData } from './_components/CategoryFormModal';
import ConfirmModal from '@/components/modal/ConfirmModal';

// Auto-scroll 설정값
const AUTO_SCROLL_THRESHOLD = 80; // 화면 경계에서 몇 px 이내일 때 스크롤 시작
const AUTO_SCROLL_MAX_SPEED = 15; // 최대 스크롤 속도 (px/frame)

export default function AdminSettingsPage() {
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
  const fetchCategories = async () => {
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
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Auto-scroll 로직 ──
  const autoScrollLoop = useCallback(() => {
    if (!isDraggingRef.current) return;

    const y = mouseYRef.current;
    const vh = window.innerHeight;

    if (y < AUTO_SCROLL_THRESHOLD) {
      // 상단 경계 근처 → 위로 스크롤
      const intensity = 1 - (y / AUTO_SCROLL_THRESHOLD);
      window.scrollBy(0, -(intensity * AUTO_SCROLL_MAX_SPEED));
    } else if (y > vh - AUTO_SCROLL_THRESHOLD) {
      // 하단 경계 근처 → 아래로 스크롤
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

  // ── 검색 및 정렬 필터링 (프론트엔드 필터) ──
  const filteredCategories = useMemo(() => {
    let list = [...categories];

    // 검색어 필터
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(kw) ||
        (c.description && c.description.toLowerCase().includes(kw))
      );
    }

    // 정렬 (이벤트 많은 순)
    if (sortByEvent) {
      list.sort((a, b) => b.eventCount - a.eventCount);
    }

    return list;
  }, [categories, searchKeyword, sortByEvent]);

  // ── 생성/수정 핸들러 ──
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

  // ── 삭제 핸들러 ──
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

  // ── 토글(노출) 핸들러 ──
  const handleToggleVisibility = (id: number, visible: boolean) => {
    setVisibilityMap(prev => ({ ...prev, [id]: visible }));
  };

  // ── Drag & Drop (with Auto-scroll) ──
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (sortByEvent) return; // 정렬 중에는 드래그 앤 드롭 방지 (순서 왜곡 방지)
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

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />
      <section className="sidebar-content">
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>시스템 설정</h1>
          </div>

          <div className={styles.topActionArea}>
            <div className={styles.tabArea}>
              <button className={`${styles.tab} ${styles.activeTab}`}>
                카테고리 관리
              </button>
            </div>
            <Button variant="primary" size="medium" onClick={handleOpenCreate}>
              + 새 카테고리 추가
            </Button>
          </div>

          <div className={styles.searchAddArea}>
            <div className={styles.searchArea}>
              <div className={styles.searchRow}>
                <div className={styles.searchField}>
                  <InputField
                    variant="search"
                    placeholder="검색어를 입력하세요"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <Button
                  variant={sortByEvent ? "primary" : "secondary"}
                  size="medium"
                  onClick={() => setSortByEvent(!sortByEvent)}
                >
                  {sortByEvent ? '기본 순서 보기' : '이벤트 많은 순'}
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.listHeader}>
            <span className={`${styles.headerText} ${styles.colName}`}>카테고리명</span>
            <span className={`${styles.headerText} ${styles.colExposure}`}>노출</span>
            <div className={styles.colActions}></div>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-gray-500)' }}>
              로딩 중...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-gray-500)' }}>
              {searchKeyword ? '검색 결과가 없습니다.' : '등록된 카테고리가 없습니다.'}
            </div>
          ) : (
            <div className={styles.categoryList}>
              {filteredCategories.map((item, index) => (
                <div key={item.id} className={draggedIndex === index ? styles.dragging : ''}>
                  <CategoryItem
                    item={item}
                    index={index}
                    isVisible={visibilityMap[item.id] ?? true}
                    onDelete={setDeleteTargetId}
                    onEdit={handleOpenEdit}
                    onToggleVisibility={handleToggleVisibility}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              ))}
            </div>
          )}

          <div className={styles.paginationArea}>
            <Pagination currentPage={1} totalPages={1} onPageChange={() => { }} />
          </div>
        </div>
      </section>

      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditTarget(null); }}
        onSubmit={handleFormSubmit}
        initialData={editTarget ? { name: editTarget.name, description: editTarget.description } : null}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="카테고리 삭제"
        subtitle="정말로 이 카테고리를 삭제하시겠습니까? 관련 데이터가 있는 경우 삭제가 제한될 수 있습니다."
        confirmText="삭제"
        status="danger"
      />
    </div>
  );
}
