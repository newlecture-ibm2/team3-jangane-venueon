import { Tag } from '@/components/ui';
import CommunityPostContainer from '../components/CommunityPostContainer';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className={styles.container}>
      {/* 상단바 (디자인 시안 반영) */}
      <div className={styles.topBar}>
        <button className={styles.backButton}>
            <span>←</span> 강의 목록 보기
        </button>
      </div>

      <div className={styles.header}>
        <Tag variant="gray">수강 신청 마감일 2026-04-15</Tag>
        <h1 className={styles.title}>
          AI 시대의 마케팅 전략 세미나
        </h1>
      </div>

      {/* 방금 만든 2단 분할 컴포넌트를 배치! */}
      <CommunityPostContainer communityId={id} />
    </div>
  );
}
