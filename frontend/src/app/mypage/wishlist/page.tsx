'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Pagination } from '@/components/ui';
import styles from './page.module.css';
import { useWishlist } from './useWishlist';



export default function WishlistPage() {
  const router = useRouter();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const resData = await res.json();
        if (resData.success && resData.data) {
          const map: Record<number, string> = {};
          resData.data.forEach((c: any) => { map[c.id] = c.name; });
          setCategoryMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const {
    currentPage,
    lectures,
    totalPages,
    loading,
    handlePageChange,
  } = useWishlist();

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>찜 목록</h1>

          <div className={styles.listSection}>


            <CardGrid layout="2-cols">
              {lectures.map((lecture) => (
                <Card
                  key={lecture.wishlistId}
                  variant="landing"
                  eventId={lecture.id}
                  isWishlistedProp={true}
                  category={lecture.categoryId ? (categoryMap[lecture.categoryId] || '기타') : undefined}
                  status={lecture.status?.label || lecture.status}
                  recruitmentStatus={lecture.recruitmentStatus?.label || lecture.recruitmentStatus}
                  title={lecture.title}
                  imageUrl={lecture.thumbnailUrl ? `/upload/${lecture.thumbnailUrl}` : undefined}
                  organizer={lecture.organizer || ''}
                  dateTime={lecture.dateTime || ''}
                  location={lecture.location || ''}
                  price={lecture.price ?? 0}
                  onCardClick={() => router.push(`/events/${lecture.id}`)}
                />
              ))}
            </CardGrid>

            {!loading && lectures.length === 0 && (
              <p className={styles.emptyState}>
                아직 찜한 이벤트가 없습니다.
              </p>
            )}

            {lectures.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
