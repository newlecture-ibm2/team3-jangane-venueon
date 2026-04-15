'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import styles from './page.module.css';

import { 
  EventDetailHeader, 
  EventThumbnail, 
  HostProfile, 
  EventTabSection 
} from './_components/index';

import { HostEventDetail, Attendee } from './types';

export default function HostEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<HostEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'BASIC' | 'ATTENDEES' | 'STUDY_ROOM' | 'STATS'>('BASIC');

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const response = await api.get<{ status: string; data: HostEventDetail }>(`/host/events/${eventId}`);
        if (response.data) {
          setEvent(response.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch event detail:', err);
        setError('강의 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchDetail();
  }, [eventId]);

  useEffect(() => {
    async function fetchAttendees() {
      if (activeTab !== 'ATTENDEES') return;
      setLoadingAttendees(true);
      try {
        const response = await api.get<{ status: string; data: Attendee[] }>(`/host/events/${eventId}/attendees`);
        if (response.data) setAttendees(response.data);
      } catch (err) {
        console.error('Failed to fetch attendees:', err);
      } finally {
        setLoadingAttendees(false);
      }
    }
    fetchAttendees();
  }, [activeTab, eventId]);

  if (loading) {
    return (
      <div className="container-sidebar">
        <Sidebar role="host" />
        <main className="sidebar-content">
          <div className={styles.loadingWrapper}>강의 정보를 불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container-sidebar">
        <Sidebar role="host" />
        <main className="sidebar-content">
          <div className={styles.errorWrapper}>
            <p>{error || '강의를 찾을 수 없습니다.'}</p>
            <a href="/host/events">← 목록으로 돌아가기</a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container-sidebar" style={{ scrollbarGutter: 'stable' }}>
      <Sidebar role="host" />
      <main className="sidebar-content">
        <div className={styles.contentBody}>
          <EventDetailHeader 
            title={event.title} 
            recruitmentStatus={event.recruitmentStatus} 
          />
          
          <EventThumbnail thumbnailUrl={event.thumbnailUrl} />

          <EventTabSection 
            event={event}
            attendees={attendees}
            loadingAttendees={loadingAttendees}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          {activeTab === 'BASIC' && (
            <HostProfile 
              hostName={event.hostName} 
              hostDescription={event.hostDescription} 
              hostProfileImg={event.hostProfileImg} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
