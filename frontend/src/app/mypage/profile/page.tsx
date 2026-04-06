'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Button, InputField, UserProfile } from '@/components/ui';
import UploadModal from '@/components/modal/UploadModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useUIStore } from '@/store/useUIStore';
import styles from './page.module.css';

export default function ProfileSettingsPage() {
  const { showToast } = useUIStore();

  // 실제 DB에서 가져온 초기 데이터라고 가정 (저장 후 기준점을 바꾸기 위해 상태로 관리)
  const [baseImage, setBaseImage] = useState<string | undefined>('https://i.pravatar.cc/150?img=11');
  const [baseId, setBaseId] = useState('user123');
  const [baseName, setBaseName] = useState('장회원');

  const [profileImage, setProfileImage] = useState<string | undefined>(baseImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState(baseId);
  const [userName, setUserName] = useState(baseName);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 수정된 사항이 하나라도 있는지 확인 (버튼 활성화 여부 판별)
  const isDirty =
    profileImage !== baseImage ||
    userId !== baseId ||
    userName !== baseName;

  // '사진 변경' 클릭 시 모달 열기
  const handleImageChangeClick = () => {
    setIsUploadModalOpen(true);
  };

  // 모달에서 '확인'을 눌러 파일을 반영했을 때
  const handleUploadConfirm = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      // 이전 미리보기 이미지가 메모리에 남아있다면 해제
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
      setProfileImage(URL.createObjectURL(file));
    }
    setIsUploadModalOpen(false);
  };

  // '삭제' 클릭 시 이미지 없앰
  const handleDeleteImage = () => {
    if (profileImage && profileImage.startsWith('blob:')) {
      URL.revokeObjectURL(profileImage);
    }
    setSelectedFile(null);
    setProfileImage(undefined); // undefined면 UserProfile에서 이름 첫 글자 대체 로직 발동
  };

  // '취소' 클릭 시 모달 열기
  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  // 모달 내 '초기화(확인)' 클릭 시 모든 수정을 롤백
  const handleCancelConfirm = () => {
    if (profileImage && profileImage.startsWith('blob:')) {
      URL.revokeObjectURL(profileImage);
    }
    setProfileImage(baseImage);
    setSelectedFile(null);
    setUserId(baseId);
    setUserName(baseName);
    setIsCancelModalOpen(false);
  };

  // '저장' 버튼 클릭 시 (백엔드 연동 전 임시 로직)
  const handleSave = () => {
    // TODO: 백엔드 연결 시 여기에 fetch(API) 로직 추가

    // 저장 성공 후 현재 상태를 '초기 상태'로 갱신 (빠른 화면 반영)
    setBaseImage(profileImage);
    setBaseId(userId);
    setBaseName(userName);

    // 촌스러운 브라우저 alert 대신 디자인 시스템의 Toast 메시지를 띄움
    showToast('성공적으로 저장되었습니다.', 'success');
  };

  return (
    <div className="container-sidebar">
      {/* Sidebar: role="user"를 전달하면 내부에서 usePathname()을 통해 "프로필 설정" 메뉴가 자동 활성화됨 */}
      <Sidebar role="user" />

      <div className="sidebar-content">
        <div className={styles.content}>
          {/* 페이지 타이틀 */}
          <h1 className={styles.pageTitle}>프로필 설정</h1>

          <div className={styles.profileSection}>
            {/* 프로필 사진 + 변경/삭제 */}
            <div className={styles.imageRow}>
              {/* 공용 UserProfile 을 사용하되, CSS로 사진 크기 72px 변경 및 텍스트 숨김 처리 */}
              <UserProfile
                name="장회원"
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

            {/* 입력 폼 (Frame 92) */}
            <div className={styles.formGroup}>
              {/* 아이디 확인/수정 폼 */}
              <InputField
                label="아이디"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              {/* 이름 확인/수정 폼 */}
              <InputField
                label="이름"
                placeholder="이름을 입력하세요"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            {/* 하단 액션 버튼 (Frame 54) */}
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
    </div>
  );
}
