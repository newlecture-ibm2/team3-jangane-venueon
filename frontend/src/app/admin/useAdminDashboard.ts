import { useState, useEffect } from 'react';
import { adminSummaryAPI, AdminSummaryResponse } from '@/lib/admin-api';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const response = await adminSummaryAPI.getSummary();
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("대시보드 데이터를 가져오는 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    state: {
      data,
      isLoading
    },
    actions: {
      fetchSummary
    }
  };
}
