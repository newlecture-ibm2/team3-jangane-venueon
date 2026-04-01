"use client";

import { useUIStore } from "@/store/useUIStore";
import { useEffect, useState } from "react";

export default function Toast() {
  const { isToastOpen, toastMessage, toastType, hideToast } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isToastOpen) return null;

  // 타입별 배경색 지정
  const bgColors = {
    info: "var(--color-surface)",
    success: "var(--color-success)",
    warning: "var(--color-secondary)",
    error: "var(--color-error)",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: bgColors[toastType] || bgColors.info,
        color: "white",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        animation: "fadeInUp 0.3s ease",
        fontWeight: "bold",
      }}
    >
      <span>{toastMessage}</span>
      <button 
        onClick={hideToast}
        style={{
          color: "white",
          opacity: 0.8,
          fontSize: "1.2rem",
          padding: "0 4px"
        }}
      >
        ×
      </button>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 1rem);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
