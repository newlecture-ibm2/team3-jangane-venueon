"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useUIStore } from "@/store/useUIStore";

export type ForgotPasswordStatus = "form" | "sent" | "google";

export function useForgotPassword() {
  const router = useRouter();
  const { showToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<ForgotPasswordStatus>("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.requestTempPassword(email);
      setStatus("sent");
      showToast("임시 비밀번호가 메일로 발송되었습니다.", "success");
    } catch (err: any) {
      const msg = err.message || "요청에 실패했습니다.";
      // 구글 소셜 로그인 계정인 경우 별도 UI 표시
      if (msg.includes("구글")) {
        setStatus("google");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return {
    email, setEmail,
    loading, error,
    status,
    handleSubmit,
    goToLogin,
  };
}
