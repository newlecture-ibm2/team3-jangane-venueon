"use client";

import InputField from "@/components/ui/InputField";
import AuthFormLayout from "../../../_components/AuthFormLayout";
import { useForgotPassword } from "../../useForgotPassword";

export default function ForgotPasswordForm() {
  const { email, setEmail, loading, error, status, handleSubmit, goToLogin } = useForgotPassword();

  // 구글 계정 안내 화면
  if (status === "google") {
    return (
      <AuthFormLayout
        title="구글 계정 안내"
        onSubmit={goToLogin}
        loading={false}
        submitText="Google 로그인으로 이동"
        error=""
        footerText="다른 계정으로 시도할래요?"
        footerLinkText="비밀번호 찾기"
        footerLinkHref="/forgot-password"
      >
        <p style={{ color: "var(--color-text-gray-500)", fontSize: "15px", lineHeight: "1.6", textAlign: "center", margin: "0" }}>
          <strong>{email}</strong>은<br />
          구글 소셜 로그인으로 가입된 계정입니다.<br /><br />
          구글 로그인을 이용해 주세요.
        </p>
      </AuthFormLayout>
    );
  }

  // 발송 완료 화면
  if (status === "sent") {
    return (
      <AuthFormLayout
        title="메일 발송 완료"
        onSubmit={goToLogin}
        loading={false}
        submitText="로그인하러 가기"
        error=""
        footerText="메일이 오지 않았나요?"
        footerLinkText="다시 요청하기"
        footerLinkHref="/forgot-password"
      >
        <p style={{ color: "var(--color-text-gray-500)", fontSize: "15px", lineHeight: "1.6", textAlign: "center", margin: "0" }}>
          <strong>{email}</strong>으로<br />
          임시 비밀번호를 발송했습니다.<br /><br />
          메일함을 확인하시고 임시 비밀번호로 로그인해 주세요.
        </p>
      </AuthFormLayout>
    );
  }

  // 이메일 입력 화면
  return (
    <AuthFormLayout
      title="비밀번호 찾기"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="임시 비밀번호 발송"
      loadingText="발송 중..."
      error={error}
      footerText="비밀번호가 기억나셨나요?"
      footerLinkText="로그인"
      footerLinkHref="/login"
    >
      <p style={{ color: "var(--color-text-gray-500)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
        가입 시 사용한 이메일을 입력하시면<br />
        임시 비밀번호를 발송해 드립니다.
      </p>
      <InputField
        id="email"
        label="이메일"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="가입한 이메일을 입력하세요."
      />
    </AuthFormLayout>
  );
}
