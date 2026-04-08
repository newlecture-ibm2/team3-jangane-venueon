export const dynamic = 'force-dynamic';

import React from 'react';
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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventEditPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventDetail(id);

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>세션를 찾을 수 없습니다.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <EventForm mode="edit" eventId={id} initialData={event} />
    </div>
  );
}
