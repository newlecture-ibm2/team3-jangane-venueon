'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalOverlay from './ModalOverlay';
import styles from './BadgeDetailModal.module.css';
import { Button, Tag } from '@/components/ui';

interface BadgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeId: number | null;
}

interface SessionInfo {
  title: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  location: string;
}

interface BadgeDetail {
  id: number;
  badgeName: string;
  badgeImageUrl: string;
  category: string;
  creatorNickname: string;
  creatorProfileImg: string;
  earnedAt: string;
  eventId: number | null;
  isVisible: boolean;
  sessions: SessionInfo[];
}

export default function BadgeDetailModal({ isOpen, onClose, badgeId }: BadgeDetailModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<BadgeDetail | null>(null);

  useEffect(() => {
    if (isOpen && badgeId) {
      setLoading(true);
      fetch(`/api/badges/me/${badgeId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            setDetail(json.data);
          }
        })
        .catch((err) => console.error('Failed to fetch badge detail', err))
        .finally(() => setLoading(false));
    } else {
      setDetail(null);
    }
  }, [isOpen, badgeId]);

  const resolveImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/upload/${url}`;
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isDeletedEvent = detail?.eventId === null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            {detail?.category && <Tag variant="purple">{detail.category}</Tag>}
            <h2 className={styles.badgeTitle}>{detail?.badgeName || '로딩 중...'}</h2>
            {isDeletedEvent && <Tag variant="red">삭제된 이벤트</Tag>}
          </div>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className={styles.loading}>정보를 불러오는 중입니다...</div>
        ) : detail ? (
          <>
            {detail.badgeImageUrl && (
              <div className={styles.imageWrapper}>
                <img src={resolveImageUrl(detail.badgeImageUrl)!} alt={detail.badgeName} className={styles.image} />
              </div>
            )}

            <div className={styles.infoBlock}>
              {detail.creatorNickname && (
                <div className={styles.infoItem}>
                  {detail.creatorProfileImg && (
                    <img src={resolveImageUrl(detail.creatorProfileImg)!} alt={detail.creatorNickname} className={styles.creatorImg} />
                  )}
                  <span><strong>주최자:</strong> {detail.creatorNickname}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span><strong>취득일:</strong> {formatDate(detail.earnedAt)}</span>
              </div>
            </div>

            {detail.sessions && detail.sessions.length > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>참여자 세션 정보</h3>
                <div className={styles.sessionList}>
                  {detail.sessions.map((session, idx) => (
                    <div key={idx} className={styles.sessionItem}>
                      <span className={styles.sessionTitle}>{session.title}</span>
                      <span className={styles.sessionDetail}>
                        {formatDate(session.startTime)} ~ {formatDate(session.endTime)}
                      </span>
                      <span className={styles.sessionDetail}>
                        {session.isOnline ? '온라인 진행' : `장소: ${session.location}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actionSection}>
              <Button 
                variant="secondary" 
                style={{ flex: 1 }} 
                disabled={isDeletedEvent}
                onClick={() => detail.eventId && router.push(`/community/events/${detail.eventId}`)}
              >
                커뮤니티 이동
              </Button>
              <Button 
                variant="primary" 
                style={{ flex: 1 }} 
                disabled={isDeletedEvent}
                onClick={() => detail.eventId && router.push(`/events/${detail.eventId}`)}
              >
                이벤트 상세 보기
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.loading}>데이터를 찾을 수 없습니다.</div>
        )}
      </div>
    </ModalOverlay>
  );
}
