import Link from 'next/link';
import styles from './EventDetailHeader.module.css';

interface EventDetailHeaderProps {
  title: string;
  recruitmentStatus: { id: number; label: string } | null;
}

export const EventDetailHeader = ({ title, recruitmentStatus }: EventDetailHeaderProps) => {
  const getStatusClass = (label: string | undefined) => {
    switch (label) {
      case '모집중': return styles.statusPUBLISHED;
      case '모집예정': return styles.statusDRAFT;
      case '모집마감': return styles.statusENDED;
      default: return styles.statusDRAFT;
    }
  };

  return (
    <header className={styles.header}>
      <Link href="/host/events" className={styles.backLink}>
        ← 강의 목록 보기
      </Link>
      <div className={styles.statusBadgeWrapper}>
        <span className={`${styles.statusBadge} ${getStatusClass(recruitmentStatus?.label)}`}>
          {recruitmentStatus?.label || '진행 중'}
        </span>
      </div>
      <h1 className={styles.pageTitle}>{title}</h1>
    </header>
  );
};
