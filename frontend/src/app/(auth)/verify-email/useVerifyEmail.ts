"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/auth-api";

export type VerifyStatus = "loading" | "success" | "error";

export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 인증 링크입니다.");
      return;
    }

    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage("이메일 인증이 완료되었습니다!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "인증에 실패했습니다.");
      }
    };

    verify();
  }, [token]);

  return { status, message };
}
