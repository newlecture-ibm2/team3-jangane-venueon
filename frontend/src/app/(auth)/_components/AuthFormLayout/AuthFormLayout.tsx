import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "./AuthFormLayout.module.css";

interface AuthFormLayoutProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitText: string;
  loadingText?: string;
  error?: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  secondaryFooterText?: string;
  secondaryFooterLinkText?: string;
  secondaryFooterLinkHref?: string;
  /** 상단 영역 밖의 추가 UI (예: 회원가입용 위쪽 구글 소셜 로그인) */
  topSlot?: React.ReactNode;
  /** 하단 영역 추가 UI (예: 로그인용 아래쪽 구글 소셜 로그인) */
  bottomSlot?: React.ReactNode;
}

export default function AuthFormLayout({
  title,
  onSubmit,
  loading,
  submitText,
  loadingText = "처리 중...",
  error,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  secondaryFooterText,
  secondaryFooterLinkText,
  secondaryFooterLinkHref,
  topSlot,
  bottomSlot,
}: AuthFormLayoutProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      {/* 상단 추가 영역 */}
      {topSlot}

      <form onSubmit={onSubmit} className={styles.form}>
        {children}

        {error && <div className={styles.error}>{error}</div>}

        <Button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? loadingText : submitText}
        </Button>
      </form>

      {/* 하단 추가 영역 */}
      {bottomSlot}

      <div className={styles.footer}>
        {footerText}{" "}
        <Link href={footerLinkHref} className={styles.link}>
          {footerLinkText}
        </Link>
      </div>

      {secondaryFooterText && secondaryFooterLinkText && secondaryFooterLinkHref && (
        <div className={styles.footer} style={{ marginTop: '8px' }}>
          {secondaryFooterText}{" "}
          <Link href={secondaryFooterLinkHref} className={styles.link}>
            {secondaryFooterLinkText}
          </Link>
        </div>
      )}
    </div>
  );
}
