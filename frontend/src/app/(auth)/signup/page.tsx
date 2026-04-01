"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/auth-api";
import { useUIStore } from "@/store/useUIStore";
import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("USER"); // "USER" | "HOST"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password.length < 8) {
        throw new Error("비밀번호는 8자 이상이어야 합니다.");
      }
      
      await authAPI.signup({ email, password, nickname, role });
      showToast("회원가입이 완료되었습니다. 로그인해주세요.", "success");
      router.push("/login");
    } catch (err: any) {
      const msg = err.message || "회원가입에 실패했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>회원가입</h1>
      <p className={styles.subtitle}>기획자(HOST) 또는 일반 사용자(USER)로 가입할 수 있습니다.</p>

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
            minLength={8}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호(8자 이상)"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="nickname">닉네임</label>
          <input
            id="nickname"
            type="text"
            required
            className={styles.input}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <span className={styles.label}>회원 유형</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="USER"
                checked={role === "USER"}
                onChange={(e) => setRole(e.target.value)}
              />
              일반 사용자
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="HOST"
                checked={role === "HOST"}
                onChange={(e) => setRole(e.target.value)}
              />
              기획자 (HOST)
            </label>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "처리 중..." : "가입하기"}
        </button>
      </form>

      <div className={styles.footer}>
        이미 계정이 있으신가요? 
        <Link href="/login" className={styles.link}>
          로그인하기
        </Link>
      </div>
    </div>
  );
}
