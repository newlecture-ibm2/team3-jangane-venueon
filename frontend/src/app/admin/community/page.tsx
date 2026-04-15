'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout';
import { Pagination, InputField, Tabs, CardGrid } from '@/components/ui';
import CommunityCard from '@/app/community/components/CommunityCard';
import { format } from 'date-fns';
import { useAdminCommunity } from './useAdminCommunity';
import styles from './page.module.css';
import CommunityFilter from './_components/CommunityFilter';
import CommunityList from './_components/CommunityList';

const TAB_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'GENERAL', label: '일반 커뮤니티' },
  { value: 'EVENT', label: '이벤트 연동' },
];

export default function AdminCommunityPage() {
  const router = useRouter();
  const { state, actions } = useAdminCommunity();

  const {
    isLoading,
    activeTab,
    searchQuery,
    currentPage,
    filteredCommunities,
    totalPages,
    pagedItems,
  } = state;

  const {
    setActiveTab,
    setSearchQuery,
    setCurrentPage,
  } = actions;

  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />
      <div className="sidebar-content">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>커뮤니티 관리</h1>
          </div>


          <div className={styles.listSection}>
            <CommunityFilter
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <CommunityList
              pagedItems={pagedItems}
              isLoading={isLoading}
            />

            {filteredCommunities.length > 0 && (
              <div className={styles.paginationArea}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
