'use client';

import React from 'react';
import styles from './Card.module.css';
import { Tag, Button, StatusTag } from '@/components/ui';
import { CompanyIcon, CalendarIcon, LocationIcon, WishlistIcon } from '@/components/icons';

export interface CardProps {
  variant?: 'default' | 'landing';
  dDay?: string | number;
  status?: '게시 전' | '모집 중' | '준비 중' | '진행 중' | '종료' | string;
  tagVariant?: 'red' | 'purple' | 'green' | 'gray';
  tagText?: string;
  category?: string;
  title: string;
  imageUrl?: string;
  organizer: string;
  dateTime: string;
  location: string;
  price: string | number;
  originalPrice?: string | number;
  actionButtonText?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  onSecondaryActionClick?: () => void;
  eventId?: number;
  isWishlistedProp?: boolean;
  recruitmentStatus?: string;  // 모집상태 (OPEN, PENDING, CLOSED)
}

export default function Card({
  variant = 'default',
  dDay,
  status,
  tagText,
  category,
  title,
  imageUrl,
  organizer,
  dateTime,
  location,
  price,
  originalPrice,
  actionButtonText,
  onActionClick,
  secondaryActionText,
  onSecondaryActionClick,
  eventId,
  isWishlistedProp = false,
  recruitmentStatus
}: CardProps) {


  const [isWishlisted, setIsWishlisted] = React.useState(isWishlistedProp);

  // 초기에 전달된 관심 여부가 있으면 바로 반영되도록 효과 추가
  React.useEffect(() => {
    setIsWishlisted(isWishlistedProp);
  }, [isWishlistedProp]);

  // 숫자일 경우 ₩ 포맷 변환, 문자열일 경우 그대로 렌더링 (단, 0일 경우 '무료'로 표시)
  const formattedPrice = price === 0 
    ? '무료' 
    : typeof price === 'number' 
      ? `₩${price.toLocaleString()}`
      : price;

  const discountRate = originalPrice && typeof originalPrice === 'number' && typeof price === 'number' && originalPrice > 0 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          {variant === 'landing' ? (
            <div className={styles.categoryDotStyle}>
              {category && (
                <>
                  <span className={styles.postTypeDot} />
                  {category}
                </>
              )}
            </div>
          ) : tagText ? (
            <Tag variant="gray">{tagText}</Tag>
          ) : status ? (
            <StatusTag domain="course" status={status} />
          ) : (
            <div />
          )}

          <div className={styles.topRight}>
            {/* 모집상태 뱃지 (있으면 표시) */}
            {recruitmentStatus && (
              <StatusTag domain="recruitment" status={recruitmentStatus} />
            )}
            {/* 강의상태 뱃지 (DRAFT/PUBLISHED는 리스트에서 숨김) */}
            {status && status !== 'DRAFT' && status !== 'PUBLISHED' && (
              <StatusTag domain="course" status={status} />
            )}
            {variant === 'default' && category && (
              <span className={styles.categoryText}>{category}</span>
            )}
            {variant === 'landing' && dDay && (
              <span className={styles.dDayText}>
                {typeof dDay === 'number' && dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day' : dDay}
              </span>
            )}
            <button type="button" 
                    className={`${styles.wishlistButton} ${isWishlisted ? styles.active : ''}`} 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Optimistic update
                      const nextState = !isWishlisted;
                      setIsWishlisted(nextState);
                      
                      if (eventId) {
                        try {
                          const res = await fetch(`/api/wishlists/events/${eventId}`, { method: 'POST' });
                          if (!res.ok) {
                            // Revert on error
                            setIsWishlisted(!nextState);
                          }
                        } catch (err) {
                          setIsWishlisted(!nextState);
                        }
                      }
                    }}>
              <WishlistIcon className={styles.wishlistIcon} fill="currentColor" stroke="transparent" />
            </button>
          </div>
        </div>
        <h3 className={styles.title} title={title}>{title}</h3>
      </div>

      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.image} />
        ) : null}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <CompanyIcon className={styles.infoIcon} />
          <span className={styles.infoText}>{organizer}</span>
        </div>
        <div className={styles.infoRow}>
          <CalendarIcon className={styles.infoIcon} />
          <span className={styles.infoText}>{dateTime}</span>
        </div>
        <div className={styles.infoRow}>
          <LocationIcon className={styles.infoIcon} />
          <span className={styles.infoText}>{location}</span>
        </div>
      </div>

      <div className={styles.priceSection}>
        {discountRate !== null && discountRate > 0 && (
          <span className={styles.discountRate}>{discountRate}%</span>
        )}
        {originalPrice && (
          <span className={styles.originalPrice}>
            {typeof originalPrice === 'number' ? `₩${originalPrice.toLocaleString()}` : originalPrice}
          </span>
        )}
        <span className={styles.price}>{formattedPrice}</span>
      </div>

      {actionButtonText && (
        <div className={styles.actionWrapper}>
          {secondaryActionText && (
            <Button variant="secondary" style={{ flex: 1, height: '48px', padding: 0 }} onClick={onSecondaryActionClick}>
              {secondaryActionText}
            </Button>
          )}
          <Button variant="primary" style={{ flex: 1, height: '48px', padding: 0 }} onClick={onActionClick}>
            {actionButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}
