'use client';

import React, { useState, useEffect } from 'react';
import { Button, Pagination } from '@/components/ui';
import { useUIStore } from '@/store/useUIStore';
import styles from './page.module.css';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  creatorNickname: string;
  createdAt: string;
}

interface PageData {
  content: CommunityItem[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export default function CommunityListPage() {
  const { showToast } = useUIStore();
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/communities?page=${currentPage - 1}&size=12`);
      if (!response.ok) throw new Error('커뮤니티 목록을 불러오는데 실패했습니다.');
      const data: PageData = await response.json();
      setCommunities(data.content);
      setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
    } catch (error) {
      console.error(error);
      showToast('커뮤니티 불러오기 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [currentPage]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>커뮤니티</h1>
          <p className={styles.subtitle}>VenueOn 강의 커뮤니티에 참여하세요.</p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/community/create'}>
          커뮤니티 만들기
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loadingOrEmpty}>불러오는 중...</div>
      ) : communities.length === 0 ? (
        <div className={styles.loadingOrEmpty}>아직 생성된 커뮤니티가 없습니다.</div>
      ) : (
        <div className={styles.communityGrid}>
          {communities.map(community => (
            <div
              key={community.id}
              className={styles.communityCard}
              onClick={() => window.location.href = `/community/${community.id}`}
            >
              <div className={styles.communityName}>{community.name}</div>
              <div className={styles.communityDesc}>
                {community.description || '설명이 없습니다.'}
              </div>
              <div className={styles.communityMeta}>
                <span>👤 {community.creatorNickname}</span>
                <span>멤버 {community.memberCount}명</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
