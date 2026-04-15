import styles from './EventThumbnail.module.css';

interface EventThumbnailProps {
  thumbnailUrl: string | null;
}

export const EventThumbnail = ({ thumbnailUrl }: EventThumbnailProps) => {
  const displayThumbnail = thumbnailUrl
    ? (thumbnailUrl.startsWith('/') || thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('blob:')
      ? thumbnailUrl
      : `/upload/${thumbnailUrl}`)
    : null;

  return (
    <div className={styles.thumbnailContainer}>
      {displayThumbnail ? (
        <img src={displayThumbnail} alt="Thumbnail" className={styles.thumbnailPreviewLarge} />
      ) : (
        <div className={styles.thumbnailPlaceholderLarge}>
          <span>이미지가 없습니다</span>
        </div>
      )}
    </div>
  );
};
