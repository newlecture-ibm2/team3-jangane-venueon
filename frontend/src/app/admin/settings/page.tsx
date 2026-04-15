'use client';

import React from 'react';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { InputField, Button, Pagination } from '@/components/ui';

import CategoryItem from './_components/CategoryItem';
import CategoryFormModal from './_components/CategoryFormModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useAdminSettings } from './useAdminSettings';

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
    setDeleteTargetId,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleDelete,
    handleToggleVisibility,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = actions;

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
