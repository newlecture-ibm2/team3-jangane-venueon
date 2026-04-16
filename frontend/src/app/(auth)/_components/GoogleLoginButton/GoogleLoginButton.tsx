"use client";

import { useEffect, useRef, useCallback, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/auth-api";
import { useAuth } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import styles from "./GoogleLoginButton.module.css";

/**
 * 구글 소셜 로그인 버튼
 * Google Identity Services (GIS) 라이브러리를 사용하여
 * 사용자가 구글 계정으로 로그인/회원가입할 수 있도록 한다.
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID 가 설정되지 않으면 아무것도 렌더링하지 않는다.
 *
 * ※ SSR/CSR hydration mismatch 방지를 위해
 *   초기 렌더에서는 항상 null → useEffect 후에만 표시
 */
interface GoogleLoginButtonProps {
  /** "top"이면 상단 배치용 (버튼 -> 구분선), "bottom"이면 하단 배치용 (구분선 -> 버튼) */
  position?: "top" | "bottom";
  /** 구글 로그인 완료 후 이동할 경로 (지정하지 않으면 searchParams의 redirect 또는 "/" 로 이동) */
  redirectTo?: string;
}

function GoogleLoginButtonContent({ position = "bottom", redirectTo }: GoogleLoginButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const { showToast } = useUIStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      try {
        const result = await authAPI.googleLogin(response.credential);
        await checkSession();
        showToast("구글 로그인 성공!", "success");
        const explicitRedirect = redirectTo || searchParams.get("redirect");
        const roleId = result.user?.role?.id;
        const defaultRedirect = roleId === 1 ? "/admin/dashboard" : roleId === 3 ? "/host" : "/";
        const nextUrl = explicitRedirect || defaultRedirect;
        router.push(nextUrl);
        router.refresh();
      } catch (err: any) {
        const msg = err.message || "구글 로그인에 실패했습니다.";
        showToast(msg, "error");
      }
    },
    [router, searchParams, checkSession, showToast, redirectTo]
  );

  // 1단계: 클라이언트에서만 isReady 판별
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      setIsReady(true);
    }
  }, []);

  // 2단계: isReady && ref가 DOM에 붙은 뒤 Google 스크립트 초기화
  useEffect(() => {
    if (!isReady) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

    function initializeGoogle() {
      const google = (window as any).google;
      if (!google?.accounts?.id || !googleButtonRef.current) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });

      google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        locale: "ko",
      });
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogle();
      document.head.appendChild(script);
    } else if ((window as any).google?.accounts?.id) {
      initializeGoogle();
    } else {
      existingScript.addEventListener("load", () => initializeGoogle());
    }
  }, [isReady, handleGoogleCallback]);

  // SSR과 CSR 초기 렌더 모두 null → hydration mismatch 없음
  if (!isReady) return null;

  return (
    <div className={styles.container}>
      {position === "top" ? (
        <>
          <div ref={googleButtonRef} className={styles.googleButton} />
          <div className={styles.divider}>
            <span className={styles.dividerText}>또는</span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerText}>또는</span>
          </div>
          <div ref={googleButtonRef} className={styles.googleButton} />
        </>
      )}
    </div>
  );
}

export default function GoogleLoginButton(props: GoogleLoginButtonProps) {
  return (
    <Suspense fallback={null}>
      <GoogleLoginButtonContent {...props} />
    </Suspense>
  );
}
