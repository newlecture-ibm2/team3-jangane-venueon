'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Settings, 
  Calendar, 
  FileText, 
  Mail, 
  ShieldCheck 
} from 'lucide-react';
import styles from './NavigationGrid.module.css';

const navItems = [
  { 
    title: '사용자 관리', 
    desc: '신규 가입자 확인 및 계정 권한 설정', 
    href: '/admin/users', 
    icon: Users,
    color: '#3B82F6'
  },
  { 
    title: '이벤트 관리', 
    desc: '등록된 이벤트 승인 및 상태 제어', 
    href: '/admin/events', 
    icon: Calendar,
    color: '#8B5CF6'
  },
  { 
    title: '시스템 설정', 
    desc: '사이트 일반 설정 및 카테고리 관리', 
    href: '/admin/settings', 
    icon: Settings,
    color: '#10B981'
  },
  { 
    title: '커뮤니티 관리', 
    desc: '게시물 및 댓글 신고/관리 수행', 
    href: '/admin/community', 
    icon: ShieldCheck,
    color: '#EF4444'
  },
  { 
    title: '리포트 & 통계', 
    desc: '운영 데이터 인사이트 및 보고서', 
    href: '/admin/reports', 
    icon: FileText,
    color: '#F59E0B'
  },
  { 
    title: '문의 사항', 
    desc: '사용자 FAQ 및 1:1 문의 대응', 
    href: '/admin/contact', 
    icon: Mail,
    color: '#6366F1'
  },
];

export default function NavigationGrid() {
  return (
    <div className={styles.container}>
      {navItems.map((item, index) => (
        <Link key={index} href={item.href} className={styles.card}>
          <div className={styles.iconWrapper} style={{ backgroundColor: `${item.color}15` }}>
            <item.icon size={28} color={item.color} />
          </div>
          <div className={styles.textWrapper}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
          <div className={styles.arrow}>→</div>
        </Link>
      ))}
    </div>
  );
}
