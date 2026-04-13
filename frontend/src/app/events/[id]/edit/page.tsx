export const dynamic = 'force-dynamic';

import React from 'react';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { redirect } from 'next/navigation';
import EventForm from '../../new/_components/EventForm';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API Fetch 함수
async function getEventDetail(id: string) {
  try {
    const url = `${BACKEND_URL}/events/${id}`;
    const res = await fetch(url, {
      cache: 'no-store'
    });

    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch event details', error);
    return null;
  }
}

async function getTickets(eventId: string) {
  try {
    const url = `${BACKEND_URL}/events/${eventId}/tickets`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) return data.data || [];
    return [];
  } catch (error) {
    console.error('Failed to fetch tickets', error);
    return [];
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventEditPage({ params }: Props) {
  // 역할 기반 접근 제어: HOST 또는 ADMIN만 이벤트 수정 가능
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    const { id } = await params;
    redirect(`/login?redirect=/events/${id}/edit`);
  }

  if (session.role?.id !== 3 && session.role?.id !== 1) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>접근 권한이 없습니다</h2>
        <p style={{ color: '#666' }}>이벤트 수정은 호스트(HOST) 또는 관리자(ADMIN) 계정만 가능합니다.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  const { id } = await params;
  const [event, tickets] = await Promise.all([
    getEventDetail(id),
    getTickets(id),
  ]);

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>이벤트를 찾을 수 없습니다.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <EventForm mode="edit" eventId={id} initialData={{ ...event, tickets }} />
    </div>
  );
}
