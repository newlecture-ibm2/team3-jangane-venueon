"use client";

import InputField from "@/components/ui/InputField";
import UploadField from "@/components/ui/UploadField";
import AuthFormLayout from "../_components/AuthFormLayout";
import GoogleLoginButton from "../_components/GoogleLoginButton";
import HostAgreementSection from "./_components/HostAgreementSection/HostAgreementSection";
import { useHostSignup } from "./useHostSignup";
import styles from "./page.module.css";

export default function HostSignupPage() {
  const {
    email, setEmail,
    password, setPassword,
    passwordConfirm, setPasswordConfirm,
    organizationName, setOrganizationName,
    managerName, setManagerName,
    businessNumber, setBusinessNumber,
    setBusinessLicense,
    isBusinessVerified, setIsBusinessVerified,
    verifyLoading,
    verifyBusinessNumber,
    agreements, setAgreements,
    error, loading,
    handleSubmit,
  } = useHostSignup();

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
      topSlot={<GoogleLoginButton position="top" redirectTo="/host-signup/complete" />}
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
      <div className={styles.businessInputWrapper}>
        <div className={styles.businessInputContainer}>
          <InputField
            id="businessNumber"
            label="사업자등록번호"
            type="text"
            required
            value={businessNumber}
            onChange={(e) => {
              setBusinessNumber(e.target.value);
              setIsBusinessVerified(false);
            }}
            placeholder="숫자만 10자리 입력하세요."
            disabled={isBusinessVerified}
          />
        </div>
        <button
          type="button"
          onClick={verifyBusinessNumber}
          disabled={verifyLoading || isBusinessVerified || businessNumber.length < 10}
          className={`${styles.verifyBtn} ${isBusinessVerified ? styles.verifyBtnVerified : styles.verifyBtnDefault}`}
        >
          {verifyLoading ? "확인 중..." : isBusinessVerified ? "인증 완료" : "인증하기"}
        </button>
      </div>
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
