"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useAuth } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import InputField from "@/components/ui/InputField";
import UploadField from "@/components/ui/UploadField";
import AuthFormLayout from "../../_components/AuthFormLayout";
import HostAgreementSection, {
  HostAgreementState,
  isHostRequiredAgreed,
} from "../_components/HostAgreementSection/HostAgreementSection";

export default function HostSignupCompletePage() {
  const router = useRouter();
  const { user, checkSession } = useAuth();
  const { showToast } = useUIStore();

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

  useEffect(() => {
    // 세션이 없으면 로그인 페이지로 리다이렉트
    if (!user) {
      showToast("로그인이 필요합니다.", "error");
      router.push("/login?redirect=/host-signup/complete");
    } else if (user.role?.id === 3) {
      showToast("이미 호스트로 등록된 계정입니다.", "error");
      router.push("/host/dashboard");
    }
  }, [user, router, showToast]);

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
      // 업그레이드 API 호출
      await authAPI.upgradeToHost({
        managerName,
        orgName: organizationName,
        orgNumber: businessNumber,
        orgDescription: "",
      });

      // 세션 다시 확인 (역할 갱신)
      await checkSession();
      showToast("호스트 프로필 등록이 완료되었습니다.", "success");
      router.push("/host/dashboard");
    } catch (err: any) {
      const msg = err.message || "호스트 정보 등록에 실패했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role?.id === 3) return null;

  return (
    <AuthFormLayout
      title="호스트 정보 입력"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="호스트 정보 등록 완료"
      loadingText="등록 처리 중..."
      error={error}
      footerText=""
      footerLinkText="이전으로 돌아가기"
      footerLinkHref="/host-signup"
    >
      <div style={{ marginBottom: "20px", textAlign: "center", color: "#666" }}>
        <p>구글 계정으로 로그인되었습니다.</p>
        <p>호스트로 활동하기 위해 추가 정보를 입력해 주세요.</p>
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
