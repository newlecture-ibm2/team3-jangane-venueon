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
}: AuthFormLayoutProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      <form onSubmit={onSubmit} className={styles.form}>
        {children}

        {error && <div className={styles.error}>{error}</div>}

        <Button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? loadingText : submitText}
        </Button>
      </form>

      <div className={styles.footer}>
        {footerText}{" "}
        <Link href={footerLinkHref} className={styles.link}>
          {footerLinkText}
        </Link>
      </div>
    </div>
  );
}
