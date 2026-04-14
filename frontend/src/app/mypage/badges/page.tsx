'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';
import HolographicBadge from './_components/HolographicBadge';
import BadgeDetailModal from '@/components/modal/BadgeDetailModal';

interface BadgeListResponse {
  id: number;
  badgeName: string;
  badgeImageUrl: string;
  category: string;
  creatorNickname: string;
  creatorProfileImg: string;
  earnedAt: string;
  eventId: number | null;
  isVisible: boolean;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/badges/me');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setBadges(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch badges', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="container-sidebar">
      <Sidebar role="user" />
      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>내 배지</h1>

          {loading ? (
            <div>데이터를 불러오는 중입니다...</div>
          ) : badges.length > 0 ? (
            <div className={styles.badgeGrid}>
              {badges.map((badge) => (
                <HolographicBadge
                  key={badge.id}
                  badge={badge}
                  onClick={() => setSelectedBadgeId(badge.id)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              아직 획득한 배지가 없습니다.
            </div>
          )}
        </div>
      </div>

      <BadgeDetailModal
        isOpen={selectedBadgeId !== null}
        onClose={() => setSelectedBadgeId(null)}
        badgeId={selectedBadgeId}
      />
    </div>
  );
}
