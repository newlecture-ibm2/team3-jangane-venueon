"use client";

import { useRouter } from "next/navigation";
import { useVerifyEmail } from "../../useVerifyEmail";
import styles from "./VerifyEmailContent.module.css";

export default function VerifyEmailContent() {
  const router = useRouter();
  const { status, message } = useVerifyEmail();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <div className={styles.spinner} />
            <h1 className={styles.title}>이메일 인증 중...</h1>
            <p className={styles.description}>잠시만 기다려 주세요.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className={styles.iconSuccess}>✅</div>
            <h1 className={styles.title}>인증 완료!</h1>
            <p className={styles.description}>{message}</p>
            <p className={styles.subDescription}>이제 로그인하여 VenueOn을 이용하실 수 있습니다.</p>
            <button
              className={styles.loginButton}
              onClick={() => router.push("/login")}
            >
              로그인하러 가기
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className={styles.iconError}>❌</div>
            <h1 className={styles.title}>인증 실패</h1>
            <p className={styles.description}>{message}</p>
            <button
              className={styles.retryButton}
              onClick={() => router.push("/signup")}
            >
              다시 회원가입하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
