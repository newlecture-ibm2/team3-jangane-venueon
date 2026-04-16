import styles from './page.module.css';

export default function NotificationsPage() {
  return (
    <div className="container-sidebar">
      {/* TODO: Sidebar import */}
      <div className="sidebar-content">
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>알림 센터</h1>
        {/* 알림 목록 + 읽음 처리 */}
        </div>
      </div>
    </div>
  );
}
