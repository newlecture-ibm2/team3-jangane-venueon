"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useAuth } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import InputField from "@/components/ui/InputField";
import AuthFormLayout from "../_components/AuthFormLayout";
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
    <AuthFormLayout
      title="로그인"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="로그인"
      loadingText="로그인 중..."
      error={error}
      footerText="비밀번호를 잊으셨나요?"
      footerLinkText="비밀번호 찾기"
      footerLinkHref="#"
    >
      <InputField
        id="email"
        label="아이디"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="아이디를 입력하세요."
      />
      <InputField
        id="password"
        label="비밀번호"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
      />
    </AuthFormLayout>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}

