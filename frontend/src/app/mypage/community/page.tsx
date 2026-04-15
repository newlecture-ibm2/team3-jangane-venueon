'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { CardGrid, Pagination, InputField, Tabs } from '@/components/ui';
import CommunityCard from '@/app/community/_components/CommunityCard';
import styles from './page.module.css';

const TAB_OPTIONS = [
  { value: 'participating', label: '참여 중' },
  { value: 'community_bookmark', label: '커뮤니티 북마크' },
  { value: 'my_post', label: '내가 쓴 게시물' },
  { value: 'post_bookmark', label: '게시물 북마크' },
];

const MOCK_COMMUNITIES = [
  {
    id: 1,
    postType: "프로젝트 모집",
    timeAgo: "방금 전",
    title: "함께 사이드 프로젝트 완성할 프론트엔드 개발자 찾습니다 👀",
    keywords: ['사이드프로젝트', '프론트엔드', '리액트', '주말코딩']
  },
  {
    id: 2,
    postType: "스터디 모집",
    timeAgo: "2시간 전",
    title: "Next.js 14 앱 라우터 뽀개기 스터디 모집",
    keywords: ['Nextjs', '앱라우터', '스터디', '프론트엔드개발']
  },
  {
    id: 3,
    postType: "네트워킹",
    timeAgo: "1일 전",
    title: "판교 직장인 IT 네트워킹 및 정보 공유 모임",
    keywords: ['판교', 'IT네트워킹', '직장인모임', '오프라인']
  },
  {
    id: 4,
    postType: "코드 리뷰",
    timeAgo: "2일 전",
    title: "서로 코드리뷰 해주면서 상부상조할 백엔드 개발자 분 모셔요",
    keywords: ['코드리뷰', '백엔드', 'Java', '스프링부트']
  }
];

export default function MyCommunityPage() {
  const [activeTab, setActiveTab] = useState('participating');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1; // 목업용

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          {/* 페이지 타이틀 */}
          <h1 className={styles.pageTitle}>내 커뮤니티</h1>

          <div className={styles.listSection}>
            <Tabs
              variant="line"
              options={TAB_OPTIONS}
              activeValue={activeTab}
              onChange={handleTabChange}
            />

            <InputField
              variant="search"
              className={styles.searchBar}
            />

            <CardGrid layout="2-cols">
              {MOCK_COMMUNITIES.map((community) => (
                <CommunityCard
                  key={community.id}
                  postType={community.postType}
                  timeAgo={community.timeAgo}
                  title={community.title}
                  keywords={community.keywords}
                />
              ))}
            </CardGrid>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
