import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';

export function useCommunityCreate() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const { user, isLoggedIn } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState('true');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch('/api/badges/me');
        if (response.ok) {
          const result = await response.json();
          setBadges(result.data || []);
          if (result.data && result.data.length > 0) {
            setSelectedEventId(result.data[0].eventId.toString());
          }
        }
      } catch (e) {
        console.error('Failed to fetch badges:', e);
      } finally {
        setIsLoadingBadges(false);
      }
    };

    if (isLoggedIn) {
      fetchBadges();
    }
  }, [isLoggedIn]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('입력 오류', 'error', '커뮤니티 이름은 필수입니다.');
      return;
    }

    if (!selectedEventId) {
      showToast('선택 오류', 'error', '커뮤니티를 개설할 이벤트를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        description,
        isPublic: isPublic === 'true',
        type: 'BADGE_CREATED',
        eventId: parseInt(selectedEventId)
      };

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('커뮤니티 생성에 실패했습니다.');
      }

      const created = await response.json();
      showToast('커뮤니티 생성 완료', 'success', `"${created.name}" 커뮤니티가 생성되었습니다.`);
      
      router.push(`/community/${created.id}`);
    } catch (error) {
      console.error(error);
      showToast('생성 실패', 'error', '서버 오류가 발생했습니다. 로그인 상태를 확인해주세요.');
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
    selectedEventId,
    setSelectedEventId,
    badges,
    isLoadingBadges,
    isSubmitting,
    handleSubmit,
    router
  };
}
