'use client';

import React from 'react';
import { InputField, Dropdown, Button } from '@/components/ui';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { useCommunityWrite } from './useCommunityWrite';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false });

interface Props {
  params: Promise<{ id: string }>;
}

export default function CommunityWritePage({ params }: Props) {
  const {
    title,
    setTitle,
    content,
    setContent,
    type,
    setType,
    isSubmitting,
    handleSubmit,
    router
  } = useCommunityWrite({ params });

  return (
    <div className={styles.container}>
      
      <section className={styles.headerSection}>
        <Button variant="secondary" onClick={() => router.back()}>← 뒤로가기</Button>
        <h1 className={styles.title}>새 게시글 작성</h1>
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
            {isSubmitting ? '등록 중...' : '등록하기'}
          </Button>
        </div>
      </section>
    </div>
  );
}
