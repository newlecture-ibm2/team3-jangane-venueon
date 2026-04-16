import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

interface UsePostEditProps {
  params: Promise<{ id: string; postId: string }>;
}

export function usePostEdit({ params }: UsePostEditProps) {
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
    if (!title.trim() || !content.trim() || content === '<p></p>') {
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

  return {
    title,
    setTitle,
    content,
    setContent,
    type,
    setType,
    isLoading,
    isSubmitting,
    handleSubmit,
    router,
    communityId
  };
}
