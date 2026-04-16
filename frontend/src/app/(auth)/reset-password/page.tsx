"use client";

import InputField from "@/components/ui/InputField";
import AuthFormLayout from "../_components/AuthFormLayout";
import { useResetPassword } from "./useResetPassword";

export default function ResetPasswordPage() {
  const {
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading, error,
    isPasswordMismatch,
    handleSubmit,
  } = useResetPassword();

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
