"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/useAuthStore";

export default function Header() {
  const { user, isLoggedIn, isLoading, checkSession, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, [checkSession]);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-4) var(--space-8)",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <Link href="/" style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--color-primary)" }}>
        VenueOn
      </Link>
      <nav style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
        <Link href="/events" style={{ color: "var(--color-text)" }}>이벤트</Link>
        <Link href="/community" style={{ color: "var(--color-text)" }}>커뮤니티</Link>
        
        {mounted && isLoading ? (
          <span style={{ color: "var(--color-text-muted)" }}>...</span>
        ) : mounted && isLoggedIn ? (
          <>
            <Link href="/mypage" style={{ color: "var(--color-text)" }}>마이페이지</Link>
            <span style={{ color: "var(--color-success)", fontWeight: "bold" }}>{user?.nickname}님</span>
            <button 
              onClick={() => logout()}
              style={{ padding: "4px 8px", background: "var(--color-border)", borderRadius: "4px", color: "var(--color-text)", fontWeight: "bold" }}
            >
              로그아웃
            </button>
          </>
        ) : mounted ? (
          <Link href="/login" style={{ color: "var(--color-text)" }}>로그인</Link>
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>...</span>
        )}
      </nav>
    </header>
  );
}
