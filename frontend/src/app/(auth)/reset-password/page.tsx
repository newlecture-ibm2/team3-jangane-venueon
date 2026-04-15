"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import InputField from "@/components/ui/InputField";
import AuthFormLayout from "../_components/AuthFormLayout";

export default function ResetPasswordPage() {
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
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "", // 임시 비밀번호로 이미 로그인된 상태
          newPassword,
        }),
      });

      if (res.ok) {
        showToast("비밀번호가 성공적으로 변경되었습니다!", "success");
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch {
      setError("서버와의 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="새 비밀번호 설정"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="비밀번호 변경"
      loadingText="변경 중..."
      error={error}
      footerText=""
      footerLinkText=""
      footerLinkHref="/"
    >
      <p style={{ color: "var(--color-text-gray-500)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
        앞으로 사용할 새 비밀번호를 입력해 주세요.
      </p>
      <InputField
        id="new-password"
        label="새 비밀번호"
        type="password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="8자 이상 입력"
      />
      <InputField
        id="confirm-password"
        label="새 비밀번호 확인"
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="비밀번호를 한번 더 입력"
        error={isPasswordMismatch ? "새 비밀번호가 일치하지 않습니다." : undefined}
      />
    </AuthFormLayout>
  );
}
