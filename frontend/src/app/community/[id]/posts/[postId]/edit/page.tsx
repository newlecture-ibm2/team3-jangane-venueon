'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, TextareaField, Dropdown, Button } from '@/components/ui';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  params: Promise<{ id: string; postId: string }>;
}

export default function PostEditPage({ params }: Props) {
  const router = useRouter();
  const { showToast } = useUIStore();
  
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;
  const postId = resolvedParams.postId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('GENERAL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 기존 게시글 정보 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error('게시글을 불러올 수 없습니다.');
        
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setType(data.type);
      } catch (error) {
        console.error(error);
        showToast('로딩 실패', 'error', '게시글 정보를 가져오지 못했습니다.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, router, showToast]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('입력 오류', 'error', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        content,
        type,
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('게시글 수정에 실패했습니다.');
      }

      showToast('게시글 수정 완료', 'success', '성공적으로 글을 수정했습니다.');
      
      router.push(`/community/${communityId}`);
    } catch (error) {
      console.error(error);
      showToast('수정 실패', 'error', '서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-single">
        <div style={{ textAlign: 'center', padding: '100px' }}>게시글 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container-single">
      
      <section style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Button variant="secondary" onClick={() => router.back()}>← 뒤로가기</Button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>게시글 수정</h1>
      </section>

      <section style={{ 
        background: '#F9FAFB', 
        padding: '32px', 
        borderRadius: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        border: '1px solid #E5E7EB'
      }}>
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

        <InputField
          label="제목 (필수)"
          placeholder="게시글의 제목을 입력하세요"
          defaultValue={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextareaField
          label="본문 내용 (필수)"
          placeholder="이곳에 내용을 자세히 적어주세요."
          defaultValue={content}
          onChange={(e) => setContent(e.target.value)}
          showCount={true}
          rows={12}
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
            {isSubmitting ? '수정 중...' : '수정완료'}
          </Button>
        </div>
      </section>
    </div>
  );
}
