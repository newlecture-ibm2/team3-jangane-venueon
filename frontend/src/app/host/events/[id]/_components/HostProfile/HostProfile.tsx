import styles from './HostProfile.module.css';

interface HostProfileProps {
  hostName: string;
}

export const HostProfile = ({ hostName }: HostProfileProps) => {
  return (
    <section className={styles.sectionBox}>
      <h3 className={styles.sectionTitle}>주최자 정보</h3>
      <div className={styles.hostProfile}>
        <div className={styles.hostAvatar}>
          {hostName?.[0] || 'A'}
        </div>
        <div className={styles.hostInfo}>
          <h4 className={styles.hostName}>{hostName || '에이아이마인드 크리에이티브'}</h4>
          <p className={styles.hostBio}>
            데이터를 넘어 마케팅의 본질을 꿰뚫는 AI 마케팅 그룹으로서 10년의 풍부한 실무 마케팅기획 및 실질적 성장을 도와드립니다.
          </p>
        </div>
      </div>
    </section>
  );
};
