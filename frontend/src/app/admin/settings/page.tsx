'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { InputField, Button, Pagination } from '@/components/ui';

import CategoryItem from './_components/CategoryItem';
import CategoryFormModal from './_components/CategoryFormModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useAdminSettings } from './useAdminSettings';
import CategoryFilter from './_components/CategoryFilter';
import CategoryList from './_components/CategoryList';

export default function AdminSettingsPage() {
  const { state, actions } = useAdminSettings();

  const {
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
  } = state;

  const {
    setSearchKeyword,
    setSortByEvent,
    setIsFormOpen,
    setEditTarget,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleDelete,
    handleToggleVisibility,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    setDeleteTargetId,
  } = actions;

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />
      <section className="sidebar-content">
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>시스템 설정</h1>
          </div>

          <CategoryFilter
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            sortByEvent={sortByEvent}
            onSortToggle={() => setSortByEvent(!sortByEvent)}
            onAddClick={handleOpenCreate}
          />

          <CategoryList
            isLoading={isLoading}
            filteredCategories={filteredCategories}
            searchKeyword={searchKeyword}
            visibilityMap={visibilityMap}
            draggedIndex={draggedIndex}
            onDeleteRequest={setDeleteTargetId}
            onEditRequest={handleOpenEdit}
            onToggleVisibility={handleToggleVisibility}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />

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
