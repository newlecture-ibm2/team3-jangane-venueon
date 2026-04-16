import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

interface UseCommunityEditProps {
  id: string;
}

export function useCommunityEdit({ id }: UseCommunityEditProps) {
  const router = useRouter();
  const { showToast } = useUIStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState('true');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`/api/communities/${id}`);
        if (!response.ok) {
          throw new Error('커뮤니티 정보를 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setName(data.name);
        setDescription(data.description || '');
        setIsPublic(data.isPublic ? 'true' : 'false');
      } catch (error) {
        console.error(error);
        showToast('데이터 로드 실패', 'error', '커뮤니티 정보를 가져오지 못했습니다.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunity();
  }, [id, router, showToast]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('입력 오류', 'error', '커뮤니티 이름은 필수입니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        description,
        isPublic: isPublic === 'true',
      };

      const response = await fetch(`/api/communities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('커뮤니티 수정에 실패했습니다.');
      }

      showToast('수정 완료', 'success', '커뮤니티 정보가 성공적으로 수정되었습니다.');
      router.push(`/community/${id}`);
    } catch (error) {
      console.error(error);
      showToast('수정 실패', 'error', '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    isLoading,
    isSubmitting,
    handleSubmit,
    router
  };
}
