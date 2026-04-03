"use client";

import { useUIStore } from "@/store/useUIStore";
import { useEffect, useState } from "react";
import styles from "./Toast.module.css";
import { ToastSuccessIcon, ToastFailIcon } from "@/components/icons";

export default function Toast() {
  const { isToastOpen, toastMessage, toastSubtitle, toastType, hideToast } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isToastOpen) return null;

  return (
    <div className={`${styles.toast} ${toastType === 'success' ? styles.success : styles.error}`} onClick={hideToast}>
      <div className={styles.iconWrapper}>
        {toastType === 'success' ? <ToastSuccessIcon /> : <ToastFailIcon />}
      </div>
      
      <div className={styles.textGroup}>
        <h2 className={styles.title}>{toastMessage}</h2>
        {toastSubtitle && <p className={styles.subtitle}>{toastSubtitle}</p>}
      </div>
    </div>
  );
}
