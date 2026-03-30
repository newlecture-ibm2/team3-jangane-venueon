import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.highlight}>VenueOn</span>에서
          <br />
          특별한 이벤트를 만나보세요
        </h1>
        <p className={styles.subtitle}>
          세미나, 클래스, 밋업, 컨퍼런스 — 유료·무료 이벤트를 탐색하고 참여하세요
        </p>
        <div className={styles.actions}>
          <a href="/events" className={styles.primaryButton}>
            이벤트 둘러보기
          </a>
          <a href="/auth/signup" className={styles.secondaryButton}>
            회원가입
          </a>
        </div>
      </section>
    </div>
  );
}
