import styles from '../page.module.css';

export default function BadgesPage() {
  return (
    <div className="container-sidebar">
      {/* TODO: Sidebar import */}
      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>내 배지</h1>
        {/* 뱃지 목록 + 노출 설정 */}
        </div>
      </div>
    </div>
  );
}
