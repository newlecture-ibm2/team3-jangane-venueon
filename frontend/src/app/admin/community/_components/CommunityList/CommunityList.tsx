import React from 'react';
import { CardGrid } from '@/components/ui';
import CommunityCard from '../../../../community/_components/CommunityCard/CommunityCard';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import styles from './CommunityList.module.css';

interface CommunityItem {
  id: number;
  name: string;
  description: string;
  creatorNickname: string;
  eventName: string | null;
  createdAt: string;
}

interface CommunityListProps {
  pagedItems: CommunityItem[];
  isLoading: boolean;
}

export default function CommunityList({ pagedItems, isLoading }: CommunityListProps) {
  const router = useRouter();

  return (
    <div className={styles.cardGrid}>
      <CardGrid layout="2-cols">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))
        ) : pagedItems.length === 0 ? (
          <div className={styles.empty}>해당하는 커뮤니티가 없습니다.</div>
        ) : (
          pagedItems.map((item) => (
            <CommunityCard
              key={item.id}
              title={item.name}
              postType={item.eventName || '일반 커뮤니티'}
              timeAgo={item.createdAt ? format(new Date(item.createdAt), 'yyyy.MM.dd') : '—'}
              keywords={item.description ? item.description.split(' ').slice(0, 3) : ['커뮤니티']}
              actionButtonText="관리하기"
              onActionClick={() => router.push(`/community/${item.id}`)}
            />
          ))
        )}
      </CardGrid>
    </div>
  );
}
