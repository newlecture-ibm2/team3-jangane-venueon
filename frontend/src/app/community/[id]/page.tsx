import CommunityBoard from '@/app/community/_components/CommunityBoard/CommunityBoard';
import CommunityDetailHeader from '@/app/community/_components/CommunityDetailHeader';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}
export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;
  // 세션 정보 가져오기
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  // 서버 컴포넌트에서 커뮤니티 정보를 미리 가져옴
  const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  let communityName = '커뮤니티';
  let communityDesc = '';
  let canManage = false;
  let canWrite = true;

  try {
    const headers: Record<string, string> = {};
    if (session.jwt) {
      headers['Authorization'] = `Bearer ${session.jwt}`;
    }

    const targetUrl = `${API_BASE}/communities/${id}`;
    console.log(`[Frontend-Server] Fetching community info from: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Frontend-Server] Community data received: name=${data.name}, canManage=${data.canManage}`);
      communityName = data.name;
      communityDesc = data.description || '';
      canManage = data.canManage || false;
      canWrite = data.canWrite !== undefined ? data.canWrite : true;
    } else {
      console.error(`[Frontend-Server] Fetch failed: status=${res.status}`);
    }
  } catch (e) {
    console.error('[Frontend-Server] 커뮤니티 정보 조회 실패:', e);
  }

  return (
    <div className={`container-full ${styles.full}`}>
      {/* 상단: 커뮤니티 이름 + 뒤로가기 */}
      <CommunityDetailHeader name={communityName} description={communityDesc} canManage={canManage} />

      {/* 2단 분할: 좌측 리스트 + 우측 상세 */}
      <CommunityBoard communityId={id} canManage={canManage} canWrite={canWrite} isLoggedIn={!!session.jwt} />
    </div>
  );
}

