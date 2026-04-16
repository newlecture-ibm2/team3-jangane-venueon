import React from 'react';
import styles from './UserProfile.module.css';

export interface UserProfileProps {
  name: string;
  imageUrl?: string; // 이미지가 없을 경우를 대비해 optional 처리
  size?: 'large' | 'medium';
  className?: string;
  showName?: boolean;
}

export default function UserProfile({ 
  name, 
  imageUrl, 
  size = 'large', 
  className = '',
  showName = true
}: UserProfileProps) {
  
  const sizeClass = size === 'large' ? styles.large : styles.medium;

  return (
    <div className={`${styles.profile} ${sizeClass} ${className}`.trim()}>
      <div 
        className={styles.profileImage} 
        style={imageUrl ? { backgroundColor: 'transparent' } : undefined}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={`${name}의 프로필 이미지`} className={styles.imageContent} />
        ) : (
          /* 프로필 사진이 없을 땐 이름의 첫 글자를 보여줍니다 */
          <span style={{ color: 'white', fontWeight: 'bold', lineHeight: 1, fontSize: size === 'large' ? '14px' : '10px' }}>
            {name.charAt(0)}
          </span>
        )}
      </div>
      {showName && <span className={styles.userName}>{name}</span>}
    </div>
  );
}
