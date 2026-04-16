"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useAuth } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";

export function useLogin() {
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
      const result = await authAPI.login(email, password);
      await checkSession();

      // 임시 비밀번호로 로그인한 경우 비밀번호 변경 페이지로 이동
      if (result.tempPassword) {
        showToast("임시 비밀번호로 로그인되었습니다. 새 비밀번호를 설정해 주세요.", "info");
        router.push("/reset-password");
        return;
      }

      showToast("로그인 성공!", "success");
      const explicitRedirect = searchParams.get("redirect");
      // 명시적 redirect가 없으면 role에 따라 분기
      const roleId = result.user?.role?.id;
      const defaultRedirect = roleId === 1 ? "/admin" : roleId === 3 ? "/host" : "/";
      const redirectTo = explicitRedirect || defaultRedirect;
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    handleSubmit,
  };
}
