'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, TextareaField, Dropdown, Button } from '@/components/ui';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CommunityWritePage({ params }: Props) {
  const router = useRouter();
  const { showToast } = useUIStore();
  
  // React 19 방식의 params 언래핑
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('입력 오류', 'error', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // CreatePostRequest DTO 구조에 맞춤 (작성자는 로그인 세션의 JWT로 백엔드가 자동 식별)
      const payload = {
        title,
        content,
        type,
        communityId: Number(communityId),
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('게시글 등록에 실패했습니다.');
      }

      showToast('게시글 등록 완료', 'success', '성공적으로 글을 작성했습니다.');
      
      // 등록 성공 시 목록 페이지로 복귀
      router.push(`/community/${communityId}`);
    } catch (error) {
      console.error(error);
      showToast('등록 실패', 'error', '서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* 상단 네비게이션/타이틀 */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => router.back()}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6B7280' 
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>
          새 게시글 작성
        </h1>
      </div>

      {/* 작성 폼 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 타입 선택 Drowdown */}
        <div style={{ maxWidth: '200px' }}>
          <Dropdown
            label="말머리 (필수)"
            value={type}
            onChange={(val) => setType(val)}
            options={[
              { value: 'GENERAL', label: '일반' },
              { value: 'QUESTION', label: '질문' },
              { value: 'REVIEW', label: '후기' },
              { value: 'NOTICE', label: '공지사항' },
            ]}
          />
        </div>

        {/* 제목 입력 InputField */}
        <InputField
          label="제목 (필수)"
          placeholder="게시글의 제목을 입력하세요"
          defaultValue={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 본문 입력 TextareaField */}
        <TextareaField
          label="본문 내용 (필수)"
          placeholder="이곳에 내용을 자세히 적어주세요."
          defaultValue={content}
          onChange={(e) => setContent(e.target.value)}
          showCount={true}
        />

      </div>

      {/* 하단 버튼 영역 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
        <Button variant="secondary" size="large" onClick={() => router.back()} disabled={isSubmitting}>
          취소
        </Button>
        <Button variant="primary" size="large" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '등록하기'}
        </Button>
      </div>

    </div>
  );
}
