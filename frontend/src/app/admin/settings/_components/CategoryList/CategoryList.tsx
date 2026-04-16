import React from 'react';
import CategoryItem from '../CategoryItem/CategoryItem';
import { AdminCategoryItem } from '@/lib/admin-api';
import styles from './CategoryList.module.css';

interface CategoryListProps {
  isLoading: boolean;
  filteredCategories: AdminCategoryItem[];
  searchKeyword: string;
  visibilityMap: Record<number, boolean>;
  draggedIndex: number | null;
  onDeleteRequest: (id: number) => void;
  onEditRequest: (item: AdminCategoryItem) => void;
  onToggleVisibility: (id: number, visible: boolean) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export default function CategoryList({
  isLoading,
  filteredCategories,
  searchKeyword,
  visibilityMap,
  draggedIndex,
  onDeleteRequest,
  onEditRequest,
  onToggleVisibility,
  onDragStart,
  onDragOver,
  onDragEnd,
}: CategoryListProps) {
  if (isLoading) {
    return (
      <div className={styles.statusMessage}>
        로딩 중...
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className={styles.statusMessage}>
        {searchKeyword ? '검색 결과가 없습니다.' : '등록된 카테고리가 없습니다.'}
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <span className={`${styles.headerText} ${styles.colName}`}>카테고리명</span>
        <span className={`${styles.headerText} ${styles.colExposure}`}>노출</span>
        <div className={styles.colActions}></div>
      </div>

      <div className={styles.categoryList}>
        {filteredCategories.map((item, index) => (
          <div key={item.id} className={draggedIndex === index ? styles.dragging : ''}>
            <CategoryItem
              item={item}
              index={index}
              isVisible={visibilityMap[item.id] ?? true}
              onDelete={onDeleteRequest}
              onEdit={onEditRequest}
              onToggleVisibility={onToggleVisibility}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
