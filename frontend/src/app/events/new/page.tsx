export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { redirect } from 'next/navigation';
import EventForm from './_components/EventForm';

export default async function NewEventPage() {
  // 역할 기반 접근 제어: HOST 또는 ADMIN만 이벤트 생성 가능
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    redirect('/login?redirect=/events/new');
  }

  if (session.role !== 'HOST' && session.role !== 'ADMIN') {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>접근 권한이 없습니다</h2>
        <p style={{ color: '#666' }}>이벤트 생성은 호스트(HOST) 또는 관리자(ADMIN) 계정만 가능합니다.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <EventForm />
    </div>
  );
}
