'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';

import {
  DetailHeader,
  Thumbnail,
  HostProfile,
  TabSection
} from './_components/index';

import { useEventDetail } from './useEventDetail';

export default function HostEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const { event, loading, error, attendees, loadingAttendees, fetchAttendees } = useEventDetail(eventId);
  const [activeTab, setActiveTab] = useState<'BASIC' | 'ATTENDEES' | 'STUDY_ROOM' | 'STATS'>('BASIC');

  useEffect(() => {
    if (activeTab === 'ATTENDEES') {
      fetchAttendees();
    }
  }, [activeTab]);

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
          <DetailHeader
            title={event.title}
            recruitmentStatus={event.recruitmentStatus}
          />

          <Thumbnail thumbnailUrl={event.thumbnailUrl} />

          <TabSection
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
