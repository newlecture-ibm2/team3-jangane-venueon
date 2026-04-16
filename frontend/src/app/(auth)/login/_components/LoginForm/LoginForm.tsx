"use client";

import InputField from "@/components/ui/InputField";
import ConfirmModal from "@/components/modal/ConfirmModal";
import AuthFormLayout from "../../../_components/AuthFormLayout";
import GoogleLoginButton from "../../../_components/GoogleLoginButton";
import { useLogin } from "../../useLogin";

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    handleSubmit,
  } = useLogin();

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
        footerLinkHref="/forgot-password"
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
