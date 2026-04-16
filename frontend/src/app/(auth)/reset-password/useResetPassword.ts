"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useUIStore } from "@/store/useUIStore";

export function useResetPassword() {
  const router = useRouter();
  const { showToast } = useUIStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPasswordMismatch =
    newPassword !== "" && confirmPassword !== "" && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(newPassword);
      showToast("비밀번호가 성공적으로 변경되었습니다!", "success");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading, error,
    isPasswordMismatch,
    handleSubmit,
  };
}
