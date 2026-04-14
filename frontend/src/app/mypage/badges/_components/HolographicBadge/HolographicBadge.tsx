'use client';

import React, { useRef, useState } from 'react';
import styles from './HolographicBadge.module.css';

interface BadgeData {
  badgeName: string;
  badgeImageUrl: string;
  category: string;
  earnedAt: string;
  eventId: number | null;
}

interface HolographicBadgeProps {
  badge: BadgeData;
  onClick?: () => void;
}

export default function HolographicBadge({ badge, onClick }: HolographicBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  const [overlayStyle, setOverlayStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;

    const rotateX = -ny * 3;
    const rotateY = nx * 3;

    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    const opacity = Math.min(1, Math.abs(nx) + Math.abs(ny));
    const finalOpacity = 0.4 + (opacity * 0.5);

    setStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'none'
    });

    setOverlayStyle({
      backgroundPosition: `${bgX}% ${bgY}%`,
      filter: `opacity(${finalOpacity}) brightness(1.2)`,
      transition: 'none'
    });
  };

  const handleMouseOut = () => {
    setStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease'
    });
    setOverlayStyle({
      filter: 'opacity(0.4) brightness(1.05)',
      backgroundPosition: '50% 50%',
      transition: 'filter 0.4s ease, background-position 0.4s ease'
    });
  };

  const imageUrl = badge.badgeImageUrl
    ? badge.badgeImageUrl.startsWith('http') || badge.badgeImageUrl.startsWith('/')
      ? badge.badgeImageUrl
      : `/upload/${badge.badgeImageUrl}`
    : null;

  const isDeleted = badge.eventId === null;

  return (
    <div
      className={`${styles.container} ${isDeleted ? styles.deleted : ''}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseOut}
      onClick={onClick}
      style={style}
    >
      <div className={styles.overlay} style={overlayStyle}></div>
      <div className={styles.content}>
        <div className={styles.badgeCard}>
          <div className={styles.badgeInner}>
            <div className={styles.categoryText}>
              {isDeleted ? '삭제된 이벤트' : (badge.category || '')}
            </div>

            <div className={styles.thumbnailWrapper}>
              {imageUrl ? (
                <img src={imageUrl} alt={badge.badgeName} className={styles.thumbnail} />
              ) : (
                <div className={styles.thumbnail} style={{ backgroundColor: '#e5e7eb' }} />
              )}
            </div>

            <h3 className={styles.badgeTitle}>{badge.badgeName}</h3>

            <div className={styles.dateSection}>
              취득일: {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
