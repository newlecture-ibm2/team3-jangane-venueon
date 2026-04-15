'use client';

import React from 'react';
import { InputField, Dropdown, Button } from '@/components/ui';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { usePostEdit } from './usePostEdit';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false });

interface Props {
  params: Promise<{ id: string; postId: string }>;
}

export default function PostEditPage({ params }: Props) {
  const {
    title,
    setTitle,
    content,
    setContent,
    type,
    setType,
    isLoading,
    isSubmitting,
    handleSubmit,
    router
  } = usePostEdit({ params });

  if (isLoading) {
    return (
      <div className={styles.formContainer}>
        <div style={{ textAlign: 'center', padding: '100px' }}>게시글 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      
      <section style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Button variant="secondary" onClick={() => router.back()}>← 뒤로가기</Button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>게시글 수정</h1>
      </section>

      <section className={styles.formSection}>
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

        <div className={styles.editorWrapper}>
          <label className={styles.label}>본문 내용 (필수)</label>
          <TiptapEditor 
            content={content} 
            onChange={(html) => setContent(html)} 
            placeholder="이곳에 내용을 자세히 적어주세요."
            category="community-post"
          />
        </div>

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
