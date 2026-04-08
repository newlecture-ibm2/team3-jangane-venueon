import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        {/* Frame 66: 로고 & 서비스(회사) 정보 */}
        <div className={styles.colLogo}>
          <Logo />
          <p className={styles.companyInfo}>
            전 세계의 다양한 교육 프로그램을 발견하고 직접 개설할 수 있는 플랫폼입니다.<br />
          </p>
        </div>

        {/* Frame 67: 서비스 메뉴 */}
        <div className={styles.colLinks}>
          <h4 className={styles.colTitle}>서비스</h4>
          <ul className={styles.linkList}>
            <li><Link href="/events" className={styles.linkItem}>이벤트 탐색</Link></li>
            <li><Link href="/host/dashboard" className={styles.linkItem}>주최자 센터</Link></li>
          </ul>
        </div>

        {/* Frame 68: 정책 메뉴 */}
        <div className={styles.colLinks}>
          <h4 className={styles.colTitle}>정책</h4>
          <ul className={styles.linkList}>
            <li><Link href="/terms" className={styles.linkItem}>이용 약관</Link></li>
            <li><Link href="/privacy" className={styles.linkItem}>개인정보 처리방침</Link></li>
          </ul>
        </div>

        {/* Frame 69: 고객 지원 */}
        <div className={styles.colLinks}>
          <h4 className={styles.colTitle}>고객 지원</h4>
          <ul className={styles.linkList}>
            <li><a href="mailto:support@venueon.com" className={styles.linkItem}>support@venueon.com</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.copyright}>
        © 2026 VenueOn. All rights reserved.
      </div>
    </footer>
  );
}
