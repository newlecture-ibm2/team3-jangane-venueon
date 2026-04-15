"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProfileForm from "./_components/ProfileForm";
import { type HostProfile } from "./types";
import { hostAPI } from "@/lib/host-api";
import styles from "./page.module.css";

export default function HostProfilePage() {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hostAPI.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "프로필을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSuccess = (updatedData: HostProfile) => {
    setProfile(updatedData);
  };

  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar-content">
        <div className={styles.pageContainer}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>프로필 설정</h1>
            <p className={styles.pageDesc}>
              호스트 전용 정보를 확인하고 수정할 수 있습니다.
            </p>
          </header>

          {isLoading && (
            <div className={styles.loaderWrapper}>
              <p>정보를 불러오는 중입니다...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className={styles.errorWrapper}>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={fetchProfile}>
                다시 시도
              </button>
            </div>
          )}

          {!isLoading && !error && profile && (
            <ProfileForm initialData={profile} onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
