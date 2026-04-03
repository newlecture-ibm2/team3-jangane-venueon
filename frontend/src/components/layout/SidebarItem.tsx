import Link from 'next/link';
import React from 'react';
import styles from './SidebarItem.module.css';

export interface SidebarItemProps {
  icon: React.ElementType; // 컴포넌트로 전달되는 아이콘
  label: string;
  href: string;
  isActive?: boolean;
  isDanger?: boolean;
}

export default function SidebarItem({ icon: Icon, label, href, isActive = false, isDanger = false }: SidebarItemProps) {
  // Danger 상태가 가장 우선순위 높음, isActive는 Danger가 아닐 때만
  let itemStyle = styles.default;
  if (isDanger) {
    itemStyle = styles.danger;
  } else if (isActive) {
    itemStyle = styles.selected;
  }

  return (
    <Link 
      href={href} 
      className={`${styles.item} ${itemStyle}`}
    >
      <Icon className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
