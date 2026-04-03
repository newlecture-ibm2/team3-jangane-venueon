import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  className?: string;
  color?: string; // 어두운 배경(푸터 등)과 밝은 배경용 색상을 다르게 줘야 할 수 있으므로 추가
}

export default function Logo({ className = '', color = '#374151' }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={className} 
      style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
    >
      <span 
        style={{ 
          width: '119px',
          height: 'var(--space-36)',
          fontFamily: 'var(--font-sans)', 
          fontStyle: 'normal',
          fontWeight: 700, 
          fontSize: 'var(--font-size-h1---bold)', 
          lineHeight: 'var(--main-line-height)',
          display: 'flex',
          alignItems: 'center',
          color: color || 'var(--color-primary)',
        }}
      >
        VENUEON
      </span>
    </Link>
  );
}
