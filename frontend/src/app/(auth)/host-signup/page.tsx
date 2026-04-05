"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useUIStore } from "@/store/useUIStore";
import InputField from "@/components/ui/InputField";
import UploadField from "@/components/ui/UploadField";
import AuthFormLayout from "../_components/AuthFormLayout";
import HostAgreementSection, {
  HostAgreementState,
  isHostRequiredAgreed,
} from "./_components/HostAgreementSection/HostAgreementSection";
import styles from "./page.module.css";

export default function HostSignupPage() {
  const router = useRouter();
  const { showToast } = useUIStore();

  // 계정 정보
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 호스트 정보
  const [organizationName, setOrganizationName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);

  // 약관 동의
  const [agreements, setAgreements] = useState<HostAgreementState>({
    termsOfService: false,
    privacyPolicy: false,
    hostTerms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 필수 약관 체크
    if (!isHostRequiredAgreed(agreements)) {
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

      // 호스트 전용 signup API 호출
      await authAPI.hostSignup({
        email,
        password,
        managerName,
        orgName: organizationName,
        orgNumber: businessNumber,
        orgDescription: "",
      });

      showToast("호스트 가입 신청이 완료되었습니다.", "success");
      router.push("/login");
    } catch (err: any) {
      const msg = err.message || "호스트 가입에 실패했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="호스트 회원 가입"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="호스트 가입 신청"
      loadingText="신청 처리 중..."
      error={error}
      footerText="일반 회원으로 가입하시겠어요?"
      footerLinkText="일반 회원가입"
      footerLinkHref="/signup"
    >
      {/* ── 계정 정보 ── */}
      <InputField
        id="host-email"
        label="이메일"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일을 입력하세요."
      />
      <InputField
        id="host-password"
        label="비밀번호"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
      />
      <InputField
        id="host-passwordConfirm"
        label="비밀번호 확인"
        type="password"
        required
        minLength={8}
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        placeholder="********"
      />

      {/* ── 호스트 정보 구분선 ── */}
      <div className={styles.sectionDivider}>
        <span className={styles.sectionLabel}>호스트 정보</span>
      </div>

      <InputField
        id="organizationName"
        label="기관명"
        type="text"
        required
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        placeholder="기관명을 입력하세요."
      />
      <InputField
        id="managerName"
        label="담당자명"
        type="text"
        required
        value={managerName}
        onChange={(e) => setManagerName(e.target.value)}
        placeholder="담당자 이름을 입력하세요."
      />
      <InputField
        id="businessNumber"
        label="사업자등록번호"
        type="text"
        required
        value={businessNumber}
        onChange={(e) => setBusinessNumber(e.target.value)}
        placeholder="사업자등록번호를 입력하세요."
      />
      <UploadField
        label="사업자등록증 (선택)"
        accept="image/*,.pdf"
        onFileSelect={(file) => setBusinessLicense(file)}
      />

      {/* ── 약관 동의 ── */}
      <HostAgreementSection agreements={agreements} onChange={setAgreements} />
    </AuthFormLayout>
  );
}
