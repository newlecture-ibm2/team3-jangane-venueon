import { useState, useCallback, useEffect } from 'react';

export function useCommunity() {
  const [activeTab, setActiveTab] = useState('participating');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'participating') {
        const res = await fetch(`/api/communities/me?page=${currentPage - 1}&size=12`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.content || []);
          setTotalPages(data.totalPages || 1);
        }
      } else if (activeTab === 'post_bookmark') {
        // 백엔드에서 제공하는 북마크 게시물 목록 API
        const res = await fetch(`/api/posts/bookmarks/me?page=${currentPage - 1}&size=12`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.content || []);
          setTotalPages(data.totalPages || 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    activeTab,
    currentPage,
    totalPages,
    items,
    isLoading,
    handleTabChange,
    handlePageChange,
  };
}
