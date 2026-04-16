import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

interface UseCommunityWriteProps {
  params: Promise<{ id: string }>;
}

export function useCommunityWrite({ params }: UseCommunityWriteProps) {
  const router = useRouter();
  const { showToast } = useUIStore();
  
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      router.push(`/community/${communityId}`);
    } catch (error) {
      console.error(error);
      showToast('등록 실패', 'error', '서버 오류가 발생했습니다.');
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
    isSubmitting,
    handleSubmit,
    router,
    communityId
  };
}
