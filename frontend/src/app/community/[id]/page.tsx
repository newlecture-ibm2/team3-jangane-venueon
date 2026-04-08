import CommunityPostContainer from '@/app/community/components/CommunityPostContainer';
import CommunityDetailHeader from '@/app/community/components/CommunityDetailHeader';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;

  // 서버 컴포넌트에서 커뮤니티 정보를 미리 가져옴
  const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  let communityName = '커뮤니티';
  let communityDesc = '';

  try {
    const res = await fetch(`${API_BASE}/communities/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      communityName = data.name;
      communityDesc = data.description || '';
    }
  } catch (e) {
    console.error('커뮤니티 정보 조회 실패:', e);
  }

  return (
    <div className={`container-full ${styles.full}`}>
      {/* 상단: 커뮤니티 이름 + 뒤로가기 */}
      <CommunityDetailHeader name={communityName} description={communityDesc} />

      {/* 2단 분할: 좌측 리스트 + 우측 상세 */}
      <CommunityPostContainer communityId={id} />
    </div>
  );
}
