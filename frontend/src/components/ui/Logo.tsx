import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface LogoProps {
  className?: string;
  color?: string; // 어두운 배경(푸터 등)과 밝은 배경용 색상을 다르게 줘야 할 수 있으므로 추가
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={className} 
      style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
    >
      <Image 
        src="/logo.png" 
        alt="VenueOn Logo" 
        width={119} 
        height={36} 
        style={{ objectFit: 'contain' }}
        priority /* 로고는 상단에 항상 보이므로 LCP 성능을 위해 priority 추가 */
      />
    </Link>
  );
}
