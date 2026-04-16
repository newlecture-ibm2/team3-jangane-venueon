'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, UserProfile, Logo } from '@/components/ui';
import { useAuth } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { HeaderCommunityIcon, CartIcon, AdminIcon, CompanyIcon } from '@/components/icons';
import styles from './Header.module.css';

interface HeaderProps {
  role?: 'user' | 'host' | 'admin';
  status?: 'public' | 'signedIn' | 'myPage' | 'auth';
  userName?: string;
  userImageUrl?: string;
  className?: string;
}

export default function Header({
  role = 'user',
  status: propStatus,
  userName = '홍길동',
  userImageUrl,
  className = ''
}: HeaderProps) {
  const pathname = usePathname();
  const { user, checkSession, logout } = useAuth();

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 실제 세션의 정보가 있으면 우선적으로 보여주고, 없으면 기존 prop/기본값 사용
  const displayUserName = user?.nickname || userName;
  const rawUserImage = user?.profileImg || userImageUrl;
  // 서버 상대경로(profile/2026/04/uuid.jpg)에 /upload/ prefix 추가
  const displayUserImage = rawUserImage
    ? (rawUserImage.startsWith('/') || rawUserImage.startsWith('http') || rawUserImage.startsWith('blob:')
      ? rawUserImage
      : `/upload/${rawUserImage}`)
    : undefined;

  // /mypage 경로일 때는 항상 'myPage' 해더(세션 목록 + 프로필)를 보여주도록 강제
  const isMyPage = pathname?.startsWith('/mypage');
  const status = propStatus || (isMyPage ? 'myPage' : (user ? 'signedIn' : 'public'));

  // Zustand drawer state
  const { setSidebarDrawerOpen } = useUIStore();

  // 우측에 렌더링될 버튼/프로필 그룹 로직
  const renderActions = () => {
    // 1. 비로그인 시
    if (!user) {
      return (
        <div className={styles.actionGroup}>
          <Link href="/login"><Button variant="primary" size="medium">로그인</Button></Link>
          <Link href="/signup"><Button variant="secondary" size="medium">회원가입</Button></Link>
          <Link href="/host/intro" className={styles.hostLinkRight}>호스트 센터</Link>
        </div>
      );
    }

    const roleId = user.role?.id;
    const roleLabel = user.role?.label?.toLowerCase() || '';

    // 4. 역할 ADMIN
    if (roleId === 1 || roleLabel === 'admin') {
      return (
        <div className={styles.actionGroup}>
          <Link href="/admin" className={styles.iconLink} title="어드민 센터"><AdminIcon /></Link>
          <Link href="/community" className={styles.iconLink} title="커뮤니티"><HeaderCommunityIcon /></Link>
          <Link href="/host" className={styles.iconLink} title="호스트 센터"><CompanyIcon width="24" height="24" /></Link>
          <Link href="/mypage">
            <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" showName={false} />
          </Link>
        </div>
      );
    }

    // 3. 역할 HOST
    if (roleId === 3 || roleLabel === 'host') {
      return (
        <div className={styles.actionGroup}>
          <Link href="/community" className={styles.iconLink} title="커뮤니티"><HeaderCommunityIcon /></Link>
          <Link href="/host" className={styles.iconLink} title="호스트 센터"><CompanyIcon width="24" height="24" /></Link>
          <Link href="/mypage">
            <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" showName={false} />
          </Link>
        </div>
      );
    }

    // 2. 역할 USER (기본값)
    // "마이페이지, 장바구니, 커뮤니티, 계정 정보"
    return (
      <div className={styles.actionGroup}>
        <Link href="/community" className={styles.iconLink} title="커뮤니티"><HeaderCommunityIcon /></Link>
        <Link href="/cart" className={styles.iconLink} title="장바구니"><CartIcon /></Link>
        <Link href="/mypage">
          <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" showName={false} />
        </Link>
      </div>
    );
  };

  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.leftSection}>
        {isMyPage && (
          <button className={styles.mobileHamburgerBtn} onClick={() => setSidebarDrawerOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <Logo />
      </div>
      {renderActions()}
    </header>
  );
}

