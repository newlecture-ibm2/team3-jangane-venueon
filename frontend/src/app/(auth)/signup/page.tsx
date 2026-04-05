"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useUIStore } from "@/store/useUIStore";
import InputField from "@/components/ui/InputField";
import AuthFormLayout from "../_components/AuthFormLayout";
import AgreementSection, { AgreementState, isRequiredAgreed } from "./_components/AgreementSection";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreements, setAgreements] = useState<AgreementState>({
    termsOfService: false,
    privacyPolicy: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 필수 약관 동의 확인
    if (!isRequiredAgreed(agreements)) {
      setError("필수 약관에 모두 동의해 주세요.");
      showToast("필수 약관에 모두 동의해 주세요.", "error");
      return;
    }

    setLoading(true);

    try {
      if (password !== passwordConfirm) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
      if (password.length < 8) {
        throw new Error("비밀번호는 8자 이상이어야 합니다.");
      }
      
      await authAPI.signup({ email, password, nickname, role: "USER" });
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
    <AuthFormLayout
      title="회원가입"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="회원 가입"
      error={error}
      footerText="이미 계정이 있으신가요?"
      footerLinkText="로그인 하기"
      footerLinkHref="/login"
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
        id="nickname"
        label="이름"
        type="text"
        required
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="이름을 입력하세요."
      />
      <InputField
        id="password"
        label="비밀번호"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
      />
      <InputField
        id="passwordConfirm"
        label="비밀번호 확인"
        type="password"
        required
        minLength={8}
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        placeholder="********"
      />
      <AgreementSection agreements={agreements} onChange={setAgreements} />
    </AuthFormLayout>
  );
}

