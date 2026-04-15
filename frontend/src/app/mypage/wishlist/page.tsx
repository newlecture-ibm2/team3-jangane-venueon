'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardGrid, Pagination, InputField } from '@/components/ui';
import styles from '../events/page.module.css';

const CATEGORY_MAP: Record<number, string> = {
  1: '디자인',
  2: '개발',
  3: '마케팅',
};

export default function WishlistPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [lectures, setLectures] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wishlists/me?page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`);
        if (res.ok) {
          const json = await res.json();
          setLectures(json.data.content || []);
          setTotalPages(json.data.totalPages || 1);
        } else {
          setLectures([]);
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>찜 목록</h1>

          <div className={styles.listSection}>
            <InputField
              variant="search"
              className={styles.searchBar}
            />

            <CardGrid layout="2-cols">
              {lectures.map((lecture) => (
                <Card
                  key={lecture.wishlistId}
                  variant="landing"
                  eventId={lecture.id}
                  isWishlistedProp={true}
                  category={lecture.categoryId ? (CATEGORY_MAP[lecture.categoryId] || '기타') : undefined}
                  status={lecture.status?.label || lecture.status}
                  recruitmentStatus={lecture.recruitmentStatus?.label || lecture.recruitmentStatus}
                  title={lecture.title}
                  imageUrl={lecture.thumbnailUrl ? `/upload/${lecture.thumbnailUrl}` : undefined}
                  organizer={lecture.organizer}
                  dateTime={lecture.dateTime}
                  location={lecture.location}
                  price={lecture.price}
                  onCardClick={() => router.push(`/events/${lecture.id}`)}
                />
              ))}
            </CardGrid>

            {!loading && lectures.length === 0 && (
              <p style={{ color: 'var(--color-text-gray-500)', textAlign: 'center', width: '100%', padding: 'var(--space-48) 0' }}>
                아직 찜한 세션이 없습니다.
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
