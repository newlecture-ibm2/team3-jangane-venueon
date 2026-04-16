import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  hostName: string;
  hostDescription?: string | null;
  hostProfileImg?: string | null;
}

export const ProfileCard = ({ hostName, hostDescription, hostProfileImg }: ProfileCardProps) => {
  return (
    <section className={styles.sectionBox}>
      <h3 className={styles.sectionTitle}>주최자 정보</h3>
      <div className={styles.hostProfile}>
        <div className={styles.hostAvatar}>
          {hostProfileImg ? (
            <img
              src={`/api${hostProfileImg.startsWith('/') ? '' : '/'}${hostProfileImg}`}
              alt={hostName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            hostName?.[0] || 'A'
          )}
        </div>
        <div className={styles.hostInfo}>
          <h4 className={styles.hostName}>{hostName}</h4>
          <p className={styles.hostBio}>
            {hostDescription || '등록된 소개글이 없거나 아직 제공되지 않았습니다.'}
          </p>
        </div>
      </div>
    </section>
  );
};
