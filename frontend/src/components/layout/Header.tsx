import React from 'react';
import Link from 'next/link';
import { Button, UserProfile, Logo } from '@/components/ui';
import styles from './Header.module.css';

export interface HeaderProps {
  role?: 'user' | 'host' | 'admin';
  status?: 'public' | 'signedIn' | 'myPage' | 'auth';
  // 프로필에 표시될 이름이나 사진을 부모에서 전달받을 수 있도록 설정 (기본값 제공)
  userName?: string;
  userImageUrl?: string;
  className?: string;
}

export default function Header({ 
  role = 'user', 
  status = 'public',
  userName = '홍길동',
  userImageUrl,
  className = ''
}: HeaderProps) {
  
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
            <Link href="/dashboard"><Button variant="outlined" size="medium">내 강의실</Button></Link>
            <UserProfile name={userName} imageUrl={userImageUrl} size="large" />
          </div>
        );
      }
      if (status === 'myPage') {
        return (
          <div className={styles.actionGroup}>
            <Link href="/seminars"><Button variant="secondary" size="medium">강의 목록</Button></Link>
            <Link href="/dashboard"><Button variant="outlined" size="medium">내 강의실</Button></Link>
            <UserProfile name={userName} imageUrl={userImageUrl} size="large" />
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
              <Button variant="outlined" size="medium">내 강의실</Button>
            </Link>
            <UserProfile name={userName} imageUrl={userImageUrl} size="large" />
          </div>
        );
      }
    }

    // Role: Admin (관리자)
    if (role === 'admin') {
      return (
        <div className={styles.actionGroup}>
          <UserProfile name={userName} imageUrl={userImageUrl} size="large" />
        </div>
      );
    }

    return null;
  };

  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <Logo />
      {renderActions()}
    </header>
  );
}
