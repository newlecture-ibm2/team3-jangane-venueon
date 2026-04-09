'use client';

import React from 'react';
import styles from '../page.module.css';
import { Toggle, StatusTag } from '@/components/ui';
import { 
  DeleteIcon, 
  DragIcon
} from '@/components/icons';
import { AdminCategoryItem } from '@/lib/admin-api';

interface CategoryItemProps {
  item: AdminCategoryItem;
  icon: React.ElementType;
  onDelete: (id: number) => void;
  // Drag and Drop props
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export default function CategoryItem({ 
  item, 
  icon: Icon, 
  onDelete, 
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
        <div className={styles.iconWrapper}>
          <Icon width={20} height={20} />
        </div>
        <div className={styles.nameContainer}>
          <span className={styles.categoryName}>{item.name}</span>
          {item.description && (
            <span className={styles.categoryDesc}>{item.description}</span>
          )}
        </div>
      </div>

      <div className={styles.colExposure}>
        <Toggle checked={true} onChange={() => {}} />
      </div>

      <div className={styles.colStatus}>
        <StatusTag domain="payment" status="결제 완료" />
      </div>

      <div className={styles.itemActions}>
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
