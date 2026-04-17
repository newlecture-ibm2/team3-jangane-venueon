'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Button, InputField, UserProfile, Toggle, Tabs } from '@/components/ui';
import UploadModal from '@/components/modal/UploadModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import styles from './page.module.css';
import { useProfile } from './useProfile';

export default function ProfileSettingsPage() {
  const {
    profileImage,
    userEmail,
    userName,
    setUserName,
    showBadge,
    setShowBadge,
    categories,
    availableCategories,
    isDirty,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleImageChangeClick,
    handleUploadConfirm,
    handleDeleteImage,
    handleCancelClick,
    handleCancelConfirm,
    handleSave,
    handleDeleteAccount,
    toggleCategory,
  } = useProfile();

  return (
    <div className="container-sidebar">
      {/* Sidebar: role="user"를 전달하면 내부에서 usePathname()을 통해 "프로필 설정" 메뉴가 자동 활성화됨 */}
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          {/* 페이지 타이틀 */}
          <div className={styles.sectionBlock}>
            <h1 className={styles.pageTitle}>프로필 설정</h1>

            <div className={styles.profileForm}>
              {/* 프로필 사진 + 변경/삭제 */}
              <div className={styles.imageRow}>
                {/* 공용 UserProfile 을 사용하되, CSS로 사진 크기 72px 변경 및 텍스트 숨김 처리 */}
                <UserProfile
                  name={userName || '사용자'}
                  imageUrl={profileImage}
                  className={styles.customProfile}
                />

                <div className={styles.imageButtons}>
                  <Button variant="primary" onClick={handleImageChangeClick}>
                    프로필 사진 변경
                  </Button>
                  <Button variant="secondary" onClick={handleDeleteImage}>
                    이미지 삭제
                  </Button>
                </div>
              </div>

              {/* 입력 폼 */}
              <div className={styles.formGroup}>
                {/* 이메일 (수정 불가) */}
                <InputField
                  label="이메일"
                  value={userEmail}
                  disabled
                />
                {/* 이름 확인/수정 폼 */}
                <InputField
                  label="이름"
                  placeholder="이름을 입력하세요"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <div className={styles.headerGroup}>
              <h1 className={styles.pageTitle}>관심 카테고리 설정</h1>
              <p className={styles.subtitle}>관심있는 카테고리를 선택해주세요. 맞춤 이벤트를 추천해 드립니다.</p>
            </div>
            <Tabs
              variant="pill"
              options={availableCategories.map(cat => ({ value: cat.name, label: cat.name }))}
              activeValues={categories}
              onChange={toggleCategory}
            />
          </div>

          <div className={styles.rowSectionBlock}>
            <div className={styles.headerGroup}>
              <h1 className={styles.pageTitle}>뱃지 노출 여부</h1>
              <p className={styles.subtitle}>커뮤니티 등에서 내 프로필 옆에 활동 뱃지를 공개할지 설정합니다.</p>
            </div>
            <Toggle
              checked={showBadge}
              onChange={(e) => setShowBadge(e.target.checked)}
            />
          </div>

          <div className={styles.rowSectionBlock}>
            <div className={styles.headerGroup}>
              <h1 className={styles.pageTitle}>계정 탈퇴</h1>
              <p className={styles.subtitle}>탈퇴 시 모든 결제 내역과 참여 커뮤니티 기록이 영구적으로 삭제됩니다.</p>
            </div>
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
              계정 탈퇴하기
            </Button>
          </div>

          <div className={styles.actionButtons}>
            <Button
              variant="secondary"
              size="large"
              disabled={!isDirty}
              onClick={handleCancelClick}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="large"
              disabled={!isDirty}
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirm={handleUploadConfirm}
        title="프로필 사진 파일 업로드"
        subtitle="100MB 이하의 이미지 파일(JPG, PNG)만 업로드 가능합니다."
        accept="image/*"
        cancelText="취소"
        confirmText="변경하기"
        uploadLabel="파일 선택하기"
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        status="danger"
        title="수정 사항을 취소하시겠습니까?"
        subtitle="지금까지 수정한 내용이 모두 사라집니다."
        cancelText="계속 수정하기"
        confirmText="초기화"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        status="danger"
        title="정말 탈퇴하시겠습니까?"
        subtitle="계정 삭제 후 모든 결제 내역과 데이터는 복구할 수 없습니다."
        cancelText="취소"
        confirmText="탈퇴하기"
      />
    </div>
  );
}
