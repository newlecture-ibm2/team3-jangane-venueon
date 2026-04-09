'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { 
  InputField, 
  Button, 
  Pagination 
} from '@/components/ui';
import { 
  DashboardIcon,
  ProfileIcon,
  SettingIcon,
  SeminarSettingIcon,
  CommunityIcon,
  ReportIcon,
  DelayedRefundIcon
} from '@/components/icons';
import { adminCategoryAPI, AdminCategoryItem } from '@/lib/admin-api';
import CategoryItem from './_components/CategoryItem';
import ConfirmModal from '@/components/modal/ConfirmModal';

const ICONS = [
  DashboardIcon, ProfileIcon, SettingIcon, 
  SeminarSettingIcon, CommunityIcon, ReportIcon, DelayedRefundIcon
];

export default function AdminSettingsPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await adminCategoryAPI.getList();
      // sortOrder 순으로 정렬되어 오는지 확인 (백엔드에서 이미 처리됨)
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // 드래그 시 데이터 설정 (optional)
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // 실시간 위치 변경 (Optional: Drop 시점에만 할 수도 있음)
    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setCategories(newCategories);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    setDraggedIndex(null);

    // 변경된 모든 아이템의 순서를 API로 반영 (백엔드 효율을 위해 전체 업데이트 또는 변경된 것만)
    // 여기서는 간단하게 모든 아이템의 새로운 index를 sortOrder로 전송
    try {
      await Promise.all(
        categories.map((cat, idx) => adminCategoryAPI.updateOrder(cat.id, idx))
      );
      // 최종 확인을 위해 목록 다시 불러오기
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category order:', error);
      fetchCategories(); // 원래대로 복구
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
              <button className={`${styles.tab} ${styles.activeTab}`}>카테고리 관리</button>
            </div>
            <Button variant="primary" size="medium">+ 새 카테고리 추가</Button>
          </div>

          <div className={styles.searchAddArea}>
            <div className={styles.searchArea}>
              <InputField variant="search" placeholder="검색어를 입력하세요" />
            </div>
          </div>

          <div className={styles.listHeader}>
            <span className={`${styles.headerText} ${styles.colName}`}>카테고리명</span>
            <span className={`${styles.headerText} ${styles.colExposure}`}>노출</span>
            <span className={`${styles.headerText} ${styles.colStatus}`}>상태</span>
            <div className={styles.colActions}></div>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>
          ) : (
            <div className={styles.categoryList}>
              {categories.map((item, index) => (
                <div key={item.id} className={draggedIndex === index ? styles.dragging : ''}>
                  <CategoryItem 
                    item={item} 
                    index={index}
                    icon={ICONS[index % ICONS.length]}
                    onDelete={setDeleteTargetId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              ))}
            </div>
          )}

          <div className={styles.paginationArea}>
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </div>
      </section>

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
