'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, UserProfile, Logo } from '@/components/ui';
import { useAuth } from '@/store/useAuthStore';
import styles from './Header.module.css';

export default function Header({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading, checkSession, logout } = useAuth();

  // 최초 마운트 시 세션 확인
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 현재 경로가 로그인/회원가입 페이지인지 확인
  const isAuthPage = ['/login', '/signup', '/host/signup'].includes(pathname);

  // Auth 상태에서 role 파생
  const role = user?.role?.toLowerCase() as 'user' | 'host' | 'admin' | undefined;

  // 우측에 렌더링될 버튼/프로필 그룹 로직
  const renderActions = () => {

    // 로딩 중이면 빈 공간 (깜빡임 방지)
    if (isLoading) {
      return <div className={styles.actionGroup} />;
    }

    // Auth 페이지 (로그인/회원가입)에서는 최소한의 버튼만
    if (isAuthPage) {
      return (
        <div className={styles.actionGroup}>
          <Link href="/host/intro">
            <Button variant="outlined" size="medium">호스트 센터</Button>
          </Link>
        </div>
      );
    }

    // 비로그인 상태
    if (!isLoggedIn) {
      return (
        <div className={styles.actionGroup}>
          <Link href="/login"><Button variant="primary" size="medium">로그인</Button></Link>
          <Link href="/signup"><Button variant="secondary" size="medium">회원가입</Button></Link>
          <Link href="/host/intro"><Button variant="outlined" size="medium">호스트 센터</Button></Link>
        </div>
      );
    }

    // 로그인 상태: Role별 분기
    if (role === 'admin') {
      return (
        <div className={styles.actionGroup}>
          <UserProfile name={user?.nickname || '관리자'} size="large" />
          <Button variant="secondary" size="medium" onClick={logout}>로그아웃</Button>
        </div>
      );
    }

    if (role === 'host') {
      return (
        <div className={styles.actionGroup}>
          <Link href="/host/dashboard">
            <Button variant="outlined" size="medium">내 강의실</Button>
          </Link>
          <UserProfile name={user?.nickname || '호스트'} size="large" />
          <Button variant="secondary" size="medium" onClick={logout}>로그아웃</Button>
        </div>
      );
    }

    // 기본: USER
    return (
      <div className={styles.actionGroup}>
        <Link href="/dashboard"><Button variant="outlined" size="medium">내 강의실</Button></Link>
        <UserProfile name={user?.nickname || '사용자'} size="large" />
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

