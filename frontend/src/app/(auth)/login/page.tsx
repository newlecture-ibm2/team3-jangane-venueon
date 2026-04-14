"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useAuth } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import InputField from "@/components/ui/InputField";
import AuthFormLayout from "../_components/AuthFormLayout";
import GoogleLoginButton from "../_components/GoogleLoginButton";
import ConfirmModal from "@/components/modal/ConfirmModal";
import React, { useEffect } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const { showToast } = useUIStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("alert") === "auth_required") {
      setIsAuthModalOpen(true);
      
      // 모달이 무한 반복으로 뜨지 않도록 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("alert");
      router.replace(`?${newSearchParams.toString()}`);
    }
  }, [searchParams, router]);

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
    <>
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
      bottomSlot={<GoogleLoginButton position="bottom" />}
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

      <ConfirmModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={() => setIsAuthModalOpen(false)}
        title="로그인 필요"
        subtitle="로그인 후 이용 가능한 서비스입니다."
        confirmText="확인"
        hideCancel={true}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
