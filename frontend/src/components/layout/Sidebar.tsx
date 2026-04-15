'use client'; // URL 경로 추적을 위해 클라이언트 렌더링 필요

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './Sidebar.module.css';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useAuth } from '@/store/useAuthStore';

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
  WishlistIcon,
  RequestIcon,
  ContactIcon,
  BadgeIcon
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

function SidebarContent({ role = 'user', className = '', fakePathname }: SidebarProps) {
  const actualPathname = usePathname() || '';
  const pathname = fakePathname || actualPathname;
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const router = useRouter();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    await logout();
  };

  // Google 소셜 로그인 유저 여부
  const isSocialUser = user?.provider === 'GOOGLE';

  const getMenus = () => {
    if (pathname.startsWith('/community')) {
      return [
        { label: '전체 커뮤니티', href: '/community', icon: CommunityIcon },
        { label: '내가 참여한 커뮤니티', href: '/community?tab=joined', icon: WishlistIcon },
      ];
    }

    switch (role) {
      case 'admin':
        return [
          { label: '대시보드', href: '/admin/dashboard', icon: DashboardIcon },
          { label: '사용자 관리', href: '/admin/users', icon: ProfileIcon },
          { label: '시스템 설정', href: '/admin/settings', icon: SettingIcon },
          { label: '이벤트 관리', href: '/admin/events', icon: SeminarSettingIcon },
          { label: '커뮤니티 관리', href: '/admin/community', icon: CommunityIcon },
          { label: '신고 관리', href: '/admin/reports', icon: ReportIcon },
          { label: '문의 관리', href: '/admin/contact', icon: RequestIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
      case 'host':
        return [
          { label: '대시보드', href: '/host', icon: DashboardIcon },
          { label: '내 이벤트 목록', href: '/host/events', icon: SeminarIcon },
          { label: '프로필 설정', href: '/host/profile', icon: ProfileIcon },
          { label: '1:1 문의', href: '/host/contact', icon: ContactIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
      case 'user':
      default:
        return [
          { label: '대시보드', href: '/mypage', icon: DashboardIcon },
          { label: '내 이벤트 목록', href: '/mypage/events', icon: SeminarIcon },
          { label: '결제 내역', href: '/mypage/orders', icon: OrderIcon },
          { label: '찜 목록', href: '/mypage/wishlist', icon: WishlistIcon },
          { label: '내 커뮤니티', href: '/mypage/community', icon: CommunityIcon },
          { label: '내 뱃지', href: '/mypage/badges', icon: BadgeIcon },
          { label: '프로필 설정', href: '/mypage/profile', icon: ProfileIcon },
          // 소셜 로그인 유저는 비밀번호가 없으므로 계정 보안 메뉴 숨김
          ...(!isSocialUser ? [{ label: '계정 보안', href: '/mypage/security', icon: SecurityIcon }] : []),
          { label: '1:1 문의', href: '/mypage/contact', icon: ContactIcon },
          { label: '로그아웃', href: '/logout', icon: LogoutIcon },
        ];
    }
  };

  const menus = getMenus();

  return (
    <aside
      className={`${styles.sidebar} ${className}`.trim()}
      style={{ height: 'calc(100vh - 40px)' }}
    >
      {menus.map((menu) => {
        let isActive = false;
        
        // 커뮤니티 페이지 특수 활성화 로직
        if (pathname === '/community') {
          if (menu.href === '/community?tab=joined') {
            isActive = (tab === 'joined');
          } else if (menu.href === '/community') {
            isActive = (tab !== 'joined');
          }
        } else {
          // 일반 활성화 로직
          isActive = pathname === menu.href || (menu.href !== '/' && pathname.startsWith(`${menu.href}/`));
        }

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

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<aside className={`${styles.sidebar} ${props.className || ''}`.trim()} style={{ height: 'calc(100vh - 40px)' }} />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
