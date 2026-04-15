'use client';

import React from 'react';
import styles from '../page.module.css';
import { Toggle } from '@/components/ui';
import { 
  DeleteIcon, 
  DragIcon,
  EditIcon
} from '@/components/icons';
import { AdminCategoryItem } from '@/lib/admin-api';

interface CategoryItemProps {
  item: AdminCategoryItem;
  isVisible: boolean;
  onDelete: (id: number) => void;
  onEdit: (item: AdminCategoryItem) => void;
  onToggleVisibility: (id: number, visible: boolean) => void;
  // Drag and Drop props
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export default function CategoryItem({ 
  item, 
  isVisible,
  onDelete,
  onEdit,
  onToggleVisibility,
  index,
  onDragStart,
  onDragOver,
  onDragEnd
}: CategoryItemProps) {
  
  return (
    <div 
      className={styles.categoryItem}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
    >
      <div className={styles.itemInfo}>
        <div className={styles.nameContainer}>
          <div className={styles.nameRow}>
            <span className={styles.categoryName}>{item.name}</span>
            <span className={styles.eventCount}>
              ({item.eventCount})
            </span>
          </div>
          {item.description && (
            <span className={styles.categoryDesc}>{item.description}</span>
          )}
        </div>
      </div>

      <div className={styles.colExposure}>
        <Toggle 
          checked={isVisible} 
          onChange={() => onToggleVisibility(item.id, !isVisible)} 
        />
      </div>
      <div className={styles.itemActions}>
        <button className={styles.iconButton} onClick={() => onEdit(item)}>
          <EditIcon width={18} height={18} />
        </button>
        <button className={styles.iconButton} onClick={() => onDelete(item.id)}>
          <DeleteIcon className={styles.deleteIcon} width={20} height={20} />
        </button>
        <div className={styles.dragHandle}>
          <DragIcon width={20} height={20} />
        </div>
      </div>
    </div>
  );
}
