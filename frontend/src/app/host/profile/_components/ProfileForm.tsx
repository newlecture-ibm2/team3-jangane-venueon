"use client";

import React, { useState } from "react";
import InputField from "@/components/ui/InputField";
import TextareaField from "@/components/ui/TextareaField";
import Button from "@/components/ui/Button";
import UploadField from "@/components/ui/UploadField";
import { type HostProfile } from "../types";
import { hostAPI } from "@/lib/host-api";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/store/useAuthStore";
import styles from "./ProfileForm.module.css";
import Image from "next/image";

interface ProfileFormProps {
  initialData: HostProfile;
  onSuccess?: (updatedData: HostProfile) => void;
}

export default function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const { showToast } = useUIStore();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 수정 가능한 폼 상태
  const [orgName, setOrgName] = useState(initialData.orgName || "");
  const [managerName, setManagerName] = useState(initialData.managerName || "");
  const [orgDescription, setOrgDescription] = useState(initialData.orgDescription || "");
  const [profileImg, setProfileImg] = useState(initialData.profileImg || "");

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setProfileImg("");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/files/upload?category=host-profile", {
        method: "POST",
        body: formData,
      });
      
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "이미지 업로드에 실패했습니다.");
      }
      
      setProfileImg(result.data.filePath);
      showToast("이미지가 성공적으로 업로드되었습니다.", "success");
    } catch (error: any) {
      showToast(error.message || "이미지 업로드 중 오류가 발생했습니다.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !managerName.trim()) {
      showToast("기관명과 담당자명은 필수 입력입니다.", "error");
      return;
    }

    setLoading(true);
    try {
      const updated = await hostAPI.updateProfile({
        orgName,
        managerName,
        orgDescription,
        profileImg: profileImg || undefined,
      });

      // 전역 인증 정보(헤더의 프로필 이미지 등) 동기화
      updateUser({ profileImg: updated.profileImg });

      showToast("프로필이 성공적으로 업데이트되었습니다.", "success");
      onSuccess?.(updated);
    } catch (error: any) {
      showToast(error.message || "프로필 수정에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>기관 로고 / 프로필 정보</h2>
        <p className={styles.sectionDesc}>
          플랫폼에 노출되는 호스트의 로고 및 기본 정보를 관리할 수 있습니다.
        </p>
      </div>

      <div className={styles.profileImageSection}>
        <div className={styles.imagePreview}>
          {profileImg ? (
            <div className={styles.imageWrapper}>
               {/* 
                 Next.js 외부 이미지 사용을 피하기 위해 img 태그를 사용하거나, 
                 설정된 이미지 경로를 그대로 노출합니다. 여기서는 img 태그 사용.
               */}
              <img src={`/api${profileImg.startsWith('/') ? '' : '/'}${profileImg}`} alt="프로필 로고" className={styles.profileImgElement} />
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>이미지 없음</span>
            </div>
          )}
        </div>
        
        <div className={styles.uploadSection}>
          <UploadField 
            label="프로필 로고 변경" 
            onFileSelect={handleFileSelect} 
            accept="image/*"
            disabled={isUploading}
          />
          {isUploading && <p className={styles.uploadingText}>이미지를 업로드 중입니다...</p>}
        </div>
      </div>

      <InputField
        label="기관명"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        placeholder="기관명을 입력하세요"
        required
      />

      <InputField
        label="담당자명"
        value={managerName}
        onChange={(e) => setManagerName(e.target.value)}
        placeholder="담당자명 입력"
        required
      />

      <div className={styles.disabledField}>
        <InputField
          label="사업자등록번호 (변경 불가)"
          value={initialData.orgNumber}
          disabled
        />
        <span className={styles.disabledHelp}>
          가입 시 인증된 번호이므로 변경할 수 없습니다. 변경이 필요한 경우 관리자에게 문의하세요.
        </span>
      </div>

      <TextareaField
        label="기관 소개"
        value={orgDescription}
        onChange={(e) => setOrgDescription(e.target.value)}
        placeholder="행사 페이지 하단에 노출될 수 있는 기관 소개를 작성해주세요."
        rows={4}
        showCount
      />

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || isUploading || (!orgName.trim() || !managerName.trim())}
        >
          {loading ? "저장 중..." : "변경 사항 저장"}
        </Button>
      </div>
    </form>
  );
}
