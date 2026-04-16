import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/useUIStore';
import {
  userContactAPI,
  type ContactListItem,
  type ContactCategory,
} from '@/lib/contact-api';

export function useContact() {
  const [currentPage, setCurrentPage] = useState(1);
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── 필터 상태 ──
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 모달 상태
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<number | null>(null);

  const { showToast } = useUIStore();

  // ── 데이터 패칭 ──
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userContactAPI.getMyContacts({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        page: String(currentPage - 1),
        size: '20',
      });
      setContacts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      showToast('문의 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, categoryFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleViewDetail = (id: number) => {
    setDetailContactId(id);
    setIsDetailOpen(true);
  };

  const handleContactSubmit = async (data: {
    category: string;
    title: string;
    content: string;
    attachments?: File[];
  }) => {
    try {
      let attachmentUrl: string | undefined;

      // 첨부파일이 있으면 각각 업로드 후 URL 합치기
      if (data.attachments && data.attachments.length > 0) {
        const uploadPromises = data.attachments.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            return uploadData.data?.filePath || uploadData.data;
          }
          return null;
        });
        
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url) => url != null);
        if (validUrls.length > 0) {
          attachmentUrl = validUrls.join(',');
        }
      }

      await userContactAPI.createContact({
        category: data.category as ContactCategory,
        title: data.title,
        content: data.content,
        attachmentUrl,
      });
      showToast('문의가 접수되었습니다.', 'success');
      setIsContactOpen(false);
      fetchContacts();
    } catch (error) {
      console.error('Failed to create contact:', error);
      showToast('문의 접수에 실패했습니다.', 'error');
    }
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    contacts,
    totalPages,
    isLoading,
    keyword,
    setKeyword,
    statusFilter,
    isContactOpen,
    setIsContactOpen,
    isDetailOpen,
    setIsDetailOpen,
    detailContactId,
    fetchContacts,
    handleViewDetail,
    handleContactSubmit,
    handleStatusFilterChange,
  };
}
