'use client';

import React from 'react';
import { Header, Footer } from '@/components/layout';

export default function HeaderTestPage() {
  return (
    <div className="bg-gray-100 min-h-screen text-gray-900 flex flex-col">
      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">헤더 레이아웃 테스트 (Header Playground)</h1>
          <p className="text-gray-500 mb-8">역할(Role)과 상태(Status)의 조합에 따라 마법처럼 변하는 헤더를 확인하세요!</p>
        </div>

        <div className="flex flex-col gap-12 pb-20">
        
        {/* 1. 일반 사용자 (User) */}
        <section>
          <h2 className="px-8 text-xl font-bold mb-4 text-indigo-600">👤 User (일반 사용자 권한)</h2>
          <div className="flex flex-col gap-6">
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">1) Public (로그인 전 메인 화면 접속 시)</p>
              <div className="relative">
                <Header role="user" status="public" />
              </div>
            </div>
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">2) Auth (로그인/회원가입 등 집중이 필요한 폼 작성 중)</p>
              <div className="relative">
                <Header role="user" status="auth" />
              </div>
            </div>
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">3) SignedIn (로그인 완료 시 헤더 우측 메뉴 변경, 크기는 동일)</p>
              <div className="relative">
                <Header role="user" status="signedIn" userName="장회원" />
              </div>
            </div>
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">4) MyPage (마이페이지 진입 시 상세 버튼 노출)</p>
              <div className="relative">
                <Header role="user" status="myPage" userName="장회원" userImageUrl="https://i.pravatar.cc/150?img=11" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. 호스트 (Host) */}
        <section>
          <h2 className="px-8 text-xl font-bold mb-4 text-teal-600">🏢 Host (호스트 권한)</h2>
          <div className="flex flex-col gap-6">
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">1) Public (호스트 모집 소개 랜딩 페이지뷰)</p>
              <div className="relative">
                <Header role="host" status="public" />
              </div>
            </div>
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">2) Auth (호스트 권한 로그인 중)</p>
              <div className="relative">
                <Header role="host" status="auth" />
              </div>
            </div>
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">3) SignedIn (호스트 대시보드 진입)</p>
              <div className="relative">
                <Header role="host" status="signedIn" userName="김스폰서" userImageUrl="https://i.pravatar.cc/150?img=12" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. 관리자 (Admin) */}
        <section>
          <h2 className="px-8 text-xl font-bold mb-4 text-rose-600">👑 Admin (시스템 관리자)</h2>
          <div className="flex flex-col gap-6">
            <div>
              <p className="px-8 text-sm font-bold text-gray-600 mb-2">1) SignedIn (관리자 전용 대시보드 - 프로필만 노출)</p>
              <div className="relative">
                <Header role="admin" userName="최관리" />
              </div>
            </div>
          </div>
        </section>

      </div>
      </div>
      
      {/* 진짜 푸터처럼 페이지 맨 아래 100% width로 배치 */}
      <Footer />
    </div>
  );
}
