import { useState, useEffect, useCallback } from 'react';

const ITEMS_PER_PAGE = 8;

export interface WishlistItem {
  wishlistId: number;
  id: number;
  title: string;
  status: any;
  recruitmentStatus: any;
  thumbnailUrl?: string;
  organizer?: string;
  dateTime?: string;
  location?: string;
  price?: number;
  categoryId?: number;
}

export function useWishlist() {
  const [currentPage, setCurrentPage] = useState(1);
  const [lectures, setLectures] = useState<WishlistItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wishlists/me?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
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
  }, []);

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [currentPage, fetchWishlist]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    currentPage,
    lectures,
    totalPages,
    loading,
    handlePageChange,
  };
}
