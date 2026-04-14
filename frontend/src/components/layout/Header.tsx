'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, UserProfile, Logo } from '@/components/ui';
import { useAuth } from '@/store/useAuthStore';
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

  // 우측에 렌더링될 버튼/프로필 그룹 로직
  const renderActions = () => {

    // Auth (로그인/회원가입 등 집중이 필요한 화면)
    if (status === 'auth') {
      if (role === 'user') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/host/intro">
              <Button variant="outlined" size="medium">호스트 센터</Button>
            </Link>
          </div>
        );
      }
      // host일 땐 텅 비움
      return <div className={styles.actionGroup} />;
    }

    // Role: User (일반 사용자)
    if (role === 'user') {
      if (status === 'public') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/login"><Button variant="primary" size="medium">로그인</Button></Link>
            <Link href="/signup"><Button variant="secondary" size="medium">회원가입</Button></Link>
            <Link href="/host/intro"><Button variant="outlined" size="medium">호스트 센터</Button></Link>
          </div>
        );
      }
      if (status === 'signedIn') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/mypage"><Button variant="outlined" size="medium">마이페이지</Button></Link>
            <Link href="/mypage/profile">
              <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" />
            </Link>
            <Button variant="secondary" size="medium" onClick={logout}>로그아웃</Button>
          </div>
        );
      }
      if (status === 'myPage') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/"><Button variant="outlined" size="medium">세션 목록</Button></Link>
            <Link href="/mypage/profile">
              <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" />
            </Link>
          </div>
        );
      }
    }

    // Role: Host (호스트)
    if (role === 'host') {
      if (status === 'public') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/login"><Button variant="primary" size="medium">로그인</Button></Link>
            <Link href="/signup"><Button variant="secondary" size="medium">회원가입</Button></Link>
          </div>
        );
      }
      if (status === 'signedIn') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/host/dashboard">
              <Button variant="outlined" size="medium">마이페이지</Button>
            </Link>
            <Link href="/mypage/profile">
              <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" />
            </Link>
          </div>
        );
      }
    }

    // 로그인 상태: Role별 분기
    if (role === 'admin') {
      return (
        <div className={styles.actionGroup}>
          <Link href="/mypage/profile">
              <UserProfile name={displayUserName} imageUrl={displayUserImage} size="large" />
            </Link>
        </div>
      );
    }

    if (role === 'host') {
      return (
        <div className={styles.actionGroup}>
          <Link href="/host/dashboard">
            <Button variant="outlined" size="medium">마이페이지</Button>
          </Link>
          <Link href="/mypage/profile">
            <UserProfile name={user?.nickname || '호스트'} size="large" />
          </Link>
          <Button variant="secondary" size="medium" onClick={logout}>로그아웃</Button>
        </div>
      );
    }

    // 기본: USER
    return (
      <div className={styles.actionGroup}>
        <Link href="/mypage"><Button variant="outlined" size="medium">마이페이지</Button></Link>
        <Link href="/mypage/profile">
          <UserProfile name={user?.nickname || '사용자'} size="large" />
        </Link>
        <Button variant="secondary" size="medium" onClick={logout}>로그아웃</Button>
      </div>
    );
  };

  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <Logo />
      {renderActions()}
    </header>
  );
}

