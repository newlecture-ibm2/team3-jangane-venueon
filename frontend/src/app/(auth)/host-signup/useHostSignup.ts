"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useUIStore } from "@/store/useUIStore";
import {
  HostAgreementState,
  isHostRequiredAgreed,
} from "./_components/HostAgreementSection/HostAgreementSection";

export function useHostSignup() {
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

  // 사업자번호 인증 상태
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const verifyBusinessNumber = async () => {
    if (!businessNumber || businessNumber.length < 10) {
      showToast("유효한 사업자등록번호 10자리를 입력해 주세요.", "error");
      return;
    }
    setVerifyLoading(true);
    try {
      const res = await fetch('/api/business/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessNumber })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "인증 요청에 실패했습니다.");

      const statusData = data.data?.[0];
      if (!statusData) throw new Error("인증 결과를 확인할 수 없습니다.");

      if (statusData.tax_type === "국세청에 등록되지 않은 사업자등록번호입니다") {
        setIsBusinessVerified(false);
        showToast("국세청에 등록되지 않은 번호입니다.", "error");
      } else if (statusData.b_stt_cd === "01" || statusData.b_stt === "계속사업자") {
        setIsBusinessVerified(true);
        showToast("정상 사업자로 확인되었습니다.", "success");
      } else {
        setIsBusinessVerified(false);
        showToast(`휴/폐업 상태입니다: ${statusData.b_stt}`, "error");
      }
    } catch (err: any) {
      setIsBusinessVerified(false);
      showToast(err.message, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 필수 약관 체크
    if (!isHostRequiredAgreed(agreements)) {
      setError("필수 약관에 모두 동의해 주세요.");
      showToast("필수 약관에 모두 동의해 주세요.", "error");
      return;
    }

    if (!isBusinessVerified) {
      setError("사업자등록번호 인증을 완료해 주세요.");
      showToast("사업자등록번호 인증을 완료해 주세요.", "error");
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

      showToast("인증 메일이 발송되었습니다. 이메일을 확인해 주세요!", "success");
      router.push("/login");
    } catch (err: any) {
      const msg = err.message || "호스트 가입에 실패했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    // 계정 정보
    email, setEmail,
    password, setPassword,
    passwordConfirm, setPasswordConfirm,
    // 호스트 정보
    organizationName, setOrganizationName,
    managerName, setManagerName,
    businessNumber, setBusinessNumber,
    businessLicense, setBusinessLicense,
    // 사업자 인증
    isBusinessVerified, setIsBusinessVerified,
    verifyLoading,
    verifyBusinessNumber,
    // 약관
    agreements, setAgreements,
    // 폼 상태
    error, loading,
    handleSubmit,
  };
}
