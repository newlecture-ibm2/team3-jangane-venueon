'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, TextareaField, Dropdown, Button } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CommunityEditPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
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

  if (isLoading) {
    return (
      <div className="container-sidebar">
        <Sidebar role="user" />
        <main className="sidebar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>로딩 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />

      <main className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="secondary" onClick={() => router.back()}>← 뒤로가기</Button>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>커뮤니티 정보 수정</h1>
        </section>

        <section style={{ 
          background: '#F9FAFB', 
          padding: '32px', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px', 
          maxWidth: '800px' 
        }}>
          <InputField
            label="커뮤니티 이름 (필수)"
            placeholder="예: AI 마케팅 스터디"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextareaField
            label="커뮤니티 설명"
            placeholder="커뮤니티에 대한 간단한 소개를 적어주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            showCount={true}
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
              {isSubmitting ? '수정 중...' : '수정 완료'}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
