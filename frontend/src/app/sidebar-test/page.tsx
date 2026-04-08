'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function SidebarTestPage() {
  const containerStyle: React.CSSProperties = {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    backgroundColor: '#fff',
    minHeight: '100vh',
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '40px',
    alignItems: 'flex-start',
    backgroundColor: '#E5E7EB', /* 바깥 배경색을 어둡게 줘서 사이드바 본래 배경색이 잘 보이도록 테스트 */
    padding: '40px',
    borderRadius: '16px'
  };

  return (
    <div style={containerStyle}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-h1---bold)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
          Sidebar Component Design Test
        </h1>
        <p style={{ color: 'var(--color-text-gray-500)', fontSize: 'var(--font-size-body---medium)' }}>
          각 역할(Role)별 사이드바 렌더링 및 내부 SidebarItem 리스트 (Tailwind 완전 제거 버전)
        </p>
      </div>

      {/* Role: User */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-h2---bold)', fontWeight: 700, marginBottom: '20px' }}>
          단일 유저 (Role = 'user') - '내 강의 목록' 선택 상태
        </h2>
        <div style={wrapperStyle}>
          {/* 테스트 환경에서는 주소가 없으므로, fakePathname으로 임의의 활성 탭을 강제 지정합니다 */}
          <Sidebar role="user" fakePathname="/events" />
          <div style={{ flex: 1, padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>우측 메인 컨텐츠 영역</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>내 강의 목록 상세 테이블이 렌더링되는 공간입니다.</p>
          </div>
        </div>
      </div>

      {/* Role: Host */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-h2---bold)', fontWeight: 700, marginBottom: '20px' }}>
          호스트 (Role = 'host') - '대시보드' 선택 상태
        </h2>
        <div style={wrapperStyle}>
          <Sidebar role="host" fakePathname="/host/dashboard" />
          <div style={{ flex: 1, padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>호스트 대시보드 화면</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>이번 달 매출, 예약률 통계 그래프가 들어가는 공간입니다.</p>
          </div>
        </div>
      </div>

      {/* Role: Admin */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-h2---bold)', fontWeight: 700, marginBottom: '20px' }}>
          최고 관리자 (Role = 'admin') - 아무것도 선택되지 않은 Default 상태
        </h2>
        <div style={wrapperStyle}>
          {/* 아무것도 선택되지 않은 Hover 애니메이션 관찰용 */}
          <Sidebar role="admin" fakePathname="/empty/state" />
          <div style={{ flex: 1, padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>데이터 미선택 상태</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>사이드바 각 메뉴 위에 마우스를 올려(Hover) 보시면 부드러운 하이라이트 전환을 보실 수 있습니다!</p>
          </div>
        </div>
      </div>

    </div>
  );
}
