'use client';

import React from 'react';
import { InputField, TextareaField, Dropdown, Button } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import { useCommunityCreate } from './useCommunityCreate';

export default function CommunityCreatePage() {
  const {
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
  } = useCommunityCreate();

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
