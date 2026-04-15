import Link from 'next/link';
import { StatusTag } from '@/components/ui';
import styles from './DetailHeader.module.css';

interface DetailHeaderProps {
  title: string;
  recruitmentStatus: { id: number; label: string } | null;
}

export const DetailHeader = ({ title, recruitmentStatus }: DetailHeaderProps) => {

  return (
    <header className={styles.header}>
      <Link href="/host/events" className={styles.backLink}>
        ← 강의 목록 보기
      </Link>
      <div className={styles.statusBadgeWrapper}>
        <StatusTag domain="recruitment" status={recruitmentStatus} />
      </div>
      <h1 className={styles.pageTitle}>{title}</h1>
    </header>
  );
};
