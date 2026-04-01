"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/auth-api";
import { useAuth } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import styles from "../auth.module.css";
import React from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const { showToast } = useUIStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.login(email, password);
      await checkSession();
      showToast("로그인 성공!", "success");
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
      router.refresh(); // 리프레시를 통해 헤더 등 업데이트
    } catch (err: any) {
      const msg = err.message || "로그인에 실패했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>로그인</h1>
      <p className={styles.subtitle}>이메일과 비밀번호를 입력해주세요.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            required
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className={styles.footer}>
        계정이 없으신가요? 
        <Link href="/signup" className={styles.link}>
          회원가입하기
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
