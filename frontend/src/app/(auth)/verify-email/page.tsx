"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

type VerifyStatus = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 인증 링크입니다.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("이메일 인증이 완료되었습니다!");
        } else {
          setStatus("error");
          setMessage(data.message || "인증에 실패했습니다.");
        }
      } catch {
        setStatus("error");
        setMessage("서버와의 통신에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    };

    verify();
  }, [token]);

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
