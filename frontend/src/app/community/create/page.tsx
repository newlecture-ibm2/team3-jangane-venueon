'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, TextareaField, Dropdown, Button } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';

export default function CommunityCreatePage() {
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

  React.useEffect(() => {
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

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />

      <main className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="secondary" onClick={() => router.back()}>← 뒤로가기</Button>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>새 커뮤니티 만들기</h1>
        </section>

        <section style={{ 
          background: '#F9FAFB', 
          padding: '32px', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          maxWidth: '1000px',
          width: '100%'
        }}>
          <InputField
            label="커뮤니티 이름 (필수)"
            placeholder="예: AI 마케팅 스터디"
            defaultValue={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextareaField
            label="커뮤니티 설명"
            placeholder="커뮤니티에 대한 간단한 소개를 적어주세요."
            defaultValue={description}
            onChange={(e) => setDescription(e.target.value)}
            showCount={true}
          />

          <Dropdown
            label="대상 이벤트 선택 (수료한 이벤트)"
            value={selectedEventId}
            onChange={(val) => setSelectedEventId(val)}
            options={
              badges.length > 0 
                ? badges.map(b => ({ value: b.eventId.toString(), label: b.badgeName }))
                : [{ value: '', label: isLoadingBadges ? '로딩 중...' : '개설 가능한 이벤트가 없습니다.' }]
            }
          />

          <Dropdown
            label="공개 설정"
            value={isPublic}
            onChange={(val) => setIsPublic(val)}
            options={[
              { value: 'true', label: '공개' },
              { value: 'false', label: '비공개' },
            ]}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button 
                variant="secondary" 
                size="large" 
                onClick={() => router.back()} 
                disabled={isSubmitting}
                style={{ flex: 1 }}
            >
              취소
            </Button>
            <Button 
                variant="primary" 
                size="large" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                style={{ flex: 2 }}
            >
              {isSubmitting ? '생성 중...' : '커뮤니티 생성'}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
