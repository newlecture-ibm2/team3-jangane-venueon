"use client";

import { Suspense } from "react";
import VerifyEmailContent from "./_components/VerifyEmailContent";
import styles from "./page.module.css";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.spinner} />
            <h1 className={styles.title}>이메일 인증 중...</h1>
            <p className={styles.description}>잠시만 기다려 주세요.</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
