'use client'; // URL 경로 추적을 위해 클라이언트 렌더링 필요

import React from 'react';
import { usePathname } from 'next/navigation';
import SidebarItem from './SidebarItem';
import styles from './Sidebar.module.css';

import { 
  DashboardIcon, 
  SeminarIcon, 
  SettingIcon, 
  CommunityIcon, 
  ProfileIcon,
  LogoutIcon,
  SeminarSettingIcon,
  ReportIcon,
  DelayedRefundIcon
} from '@/components/icons';

export interface SidebarProps {
  role?: 'admin' | 'host' | 'user';
  className?: string;
  // 테스트 페이지에서 강제로 Active 탭을 시각적으로 고정해주기 위해 주입하는 변수 (실 서버에선 무시됨)
  fakePathname?: string; 
}

export default function Sidebar({ role = 'user', className = '', fakePathname }: SidebarProps) {
  const actualPathname = usePathname() || '';
  const pathname = fakePathname || actualPathname;

  const getMenus = () => {
    switch(role) {
      case 'admin':
        return [
          { label: '대시보드', href: '/admin/dashboard', icon: DashboardIcon },
          { label: '사용자 관리', href: '/admin/users', icon: ProfileIcon },
          { label: '시스템 설정', href: '/admin/settings', icon: SettingIcon },
          { label: '강의 관리', href: '/admin/seminars', icon: SeminarSettingIcon },
          { label: '커뮤니티 관리', href: '/admin/community', icon: CommunityIcon },
          { label: '신고 관리', href: '/admin/reports', icon: ReportIcon },
          { label: '환불 모니터링', href: '/admin/refunds', icon: DelayedRefundIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
      case 'host':
        return [
          { label: '대시보드', href: '/host/dashboard', icon: DashboardIcon },
          { label: '내 강의 목록', href: '/host/seminars', icon: SeminarIcon },
          { label: '프로필 설정', href: '/host/profile', icon: ProfileIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
      case 'user':
      default:
        return [
          { label: '내 강의 목록', href: '/seminars', icon: SeminarIcon },
          { label: '프로필 설정', href: '/profile', icon: ProfileIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
    }
  };

  const menus = getMenus();

  return (
    <aside 
      className={`${styles.sidebar} ${className}`.trim()}
      style={{ height: 'calc(100vh - 40px)' }} // 유동적 높이 브라우저 뷰포트 지원
    >
      {menus.map((menu) => {
        const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
        return (
          <SidebarItem
            key={menu.href}
            icon={menu.icon}
            label={menu.label}
            href={menu.href}
            isActive={isActive}
            isDanger={menu.href === '/logout'} // 로그아웃 특수 스타일용 프롭
          />
        );
      })}
    </aside>
  );
}
