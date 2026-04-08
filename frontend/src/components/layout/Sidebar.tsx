'use client'; // URL 경로 추적을 위해 클라이언트 렌더링 필요

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import ConfirmModal from '@/components/modal/ConfirmModal';

import { 
  DashboardIcon, 
  SeminarIcon, 
  SettingIcon, 
  CommunityIcon, 
  ProfileIcon,
  LogoutIcon,
  SeminarSettingIcon,
  ReportIcon,
  DelayedRefundIcon,
  SecurityIcon,
  OrderIcon,
  WishlistIcon
} from '@/components/icons';

export interface SidebarProps {
  role?: 'admin' | 'host' | 'user';
  className?: string;
  fakePathname?: string; 
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  isDanger?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function SidebarItem({ icon: Icon, label, href, isActive = false, isDanger = false, onClick }: SidebarItemProps) {
  let itemStyle = styles.default;
  if (isDanger) {
    itemStyle = styles.danger;
  } else if (isActive) {
    itemStyle = styles.selected;
  }

  const content = (
    <>
      <Icon className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button 
        type="button"
        onClick={onClick}
        className={`${styles.item} ${itemStyle}`}
        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link 
      href={href} 
      className={`${styles.item} ${itemStyle}`}
    >
      {content}
    </Link>
  );
}

export default function Sidebar({ role = 'user', className = '', fakePathname }: SidebarProps) {
  const actualPathname = usePathname() || '';
  const pathname = fakePathname || actualPathname;
  const router = useRouter();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 로그아웃 확인 클릭 시 동작 (가상의 로그아웃 후 로그인 페이지 이동)
  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    // TODO: 실제 로그아웃 로직(API 호출, 토큰 삭제 등)은 이곳에 추가
    router.push('/login');
  };

  const getMenus = () => {
    switch(role) {
      case 'admin':
        return [
          { label: '대시보드', href: '/admin/dashboard', icon: DashboardIcon },
          { label: '사용자 관리', href: '/admin/users', icon: ProfileIcon },
          { label: '시스템 설정', href: '/admin/settings', icon: SettingIcon },
          { label: '이벤트 관리', href: '/admin/events', icon: SeminarSettingIcon },
          { label: '커뮤니티 관리', href: '/admin/community', icon: CommunityIcon },
          { label: '신고 관리', href: '/admin/reports', icon: ReportIcon },
          { label: '환불 모니터링', href: '/admin/refunds', icon: DelayedRefundIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
      case 'host':
        return [
          { label: '대시보드', href: '/host/dashboard', icon: DashboardIcon },
          { label: '내 이벤트 목록', href: '/host/events', icon: SeminarIcon },
          { label: '프로필 설정', href: '/host/profile', icon: ProfileIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
      case 'user':
      default:
        return [
          { label: '대시보드', href: '/mypage', icon: DashboardIcon },
          { label: '내 이벤트 목록', href: '/mypage/events', icon: SeminarIcon },
          { label: '결제 내역', href: '/mypage/orders', icon: OrderIcon },
          { label: '찜 목록', href: '/mypage/wishlist', icon: WishlistIcon },
          { label: '프로필 설정', href: '/mypage/profile', icon: ProfileIcon },
          { label: '계정 보안', href: '/mypage/security', icon: SecurityIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
    }
  };

  const menus = getMenus();

  // 현재 pathname에 대해 가장 구체적으로 일치하는(가장 긴) 메뉴를 찾습니다.
  // 예: /mypage/profile 이면 /mypage 보다는 /mypage/profile 이 선택되도록 합니다.
  const activeMenu = menus.reduce((bestMatch, menu) => {
    if (pathname === menu.href || pathname.startsWith(`${menu.href}/`)) {
      if (!bestMatch || menu.href.length > bestMatch.href.length) {
        return menu;
      }
    }
    return bestMatch;
  }, null as any);

  return (
    <aside 
      className={`${styles.sidebar} ${className}`.trim()}
      style={{ height: 'calc(100vh - 40px)' }}
    >
      {menus.map((menu) => {
        const isActive = activeMenu?.href === menu.href;
        const isLogout = menu.href === '/logout';
        return (
          <SidebarItem
            key={menu.href}
            icon={menu.icon}
            label={menu.label}
            href={menu.href}
            isActive={isActive}
            isDanger={isLogout}
            onClick={isLogout ? (e) => { e.preventDefault(); setIsLogoutModalOpen(true); } : undefined}
          />
        );
      })}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="로그아웃 하시겠습니까?"
        cancelText="취소"
        confirmText="로그아웃"
      />
    </aside>
  );
}
