'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Button, InputField, UserProfile, Toggle } from '@/components/ui';
import UploadModal from '@/components/modal/UploadModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';
import tabsStyles from '@/components/ui/Tabs.module.css';
import styles from './page.module.css';



export default function ProfileSettingsPage() {
  const { showToast } = useUIStore();
  const router = useRouter();

  const [baseImage, setBaseImage] = useState<string | undefined>(undefined);
  const [baseEmail, setBaseEmail] = useState('');
  const [baseName, setBaseName] = useState('');

  const [profileImage, setProfileImage] = useState<string | undefined>(baseImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userEmail, setUserEmail] = useState(baseEmail);
  const [userName, setUserName] = useState(baseName);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 관심 카테고리 및 뱃지 상태
  const [baseCategories, setBaseCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [baseBadge, setBaseBadge] = useState<boolean>(true);
  const [showBadge, setShowBadge] = useState<boolean>(true);

  interface Category {
    id: number;
    name: string;
  }
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // 초기 프로필 및 메타데이터 로드
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.data) {
            setAvailableCategories(catData.data);
          }
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    };
    fetchMetadata();

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me'); // BFF proxy (iron-session) handles JWT
        if (res.ok) {
          const data = await res.json();
          // Assume data is { id, email, nickname, profileImg, role }
          const fetchedEmail = data.email || '';
          const fetchedName = data.nickname || '';
          // DB에 null이면 기본 아바타 아이콘이 뜨도록 undefined 로 세팅
          const fetchedImg = data.profileImg || undefined;

          setBaseEmail(fetchedEmail);
          setBaseName(fetchedName);
          setBaseImage(fetchedImg);

          // 확장 설정
          // 현재 /api/auth/me (또는 user profile API)에서 카테고리와 뱃지 정보가 넘어오지 않으면 빈값으로 치환
          const fetchedCategories = data.categories || [];
          const fetchedBadge = data.showBadge ?? true;

          setBaseCategories(fetchedCategories);
          setBaseBadge(fetchedBadge);

          setUserEmail(fetchedEmail);
          setUserName(fetchedName);
          setProfileImage(fetchedImg);
          setCategories(fetchedCategories);
          setShowBadge(fetchedBadge);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, []);

  // 수정된 사항이 하나라도 있는지 확인 (버튼 활성화 여부 판별)
  const isDirty =
    profileImage !== baseImage ||
    userName !== baseName ||
    showBadge !== baseBadge ||
    JSON.stringify(categories.sort()) !== JSON.stringify(baseCategories.sort());

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
    setUserName(baseName);
    setCategories(baseCategories);
    setShowBadge(baseBadge);
    setIsCancelModalOpen(false);
  };

  // 저장(확인) 클릭 - 실제 백엔드 연동 부분
  const handleSave = async () => {
    try {
      // BFF 프록시 경로 (Route Handler가 /api 제거 후 백엔드로 전달, JWT 자동 포함)
      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: userName,
          profileImg: profileImage,
          categories: categories,
          showBadge: showBadge,
        }),
      });

      if (res.ok) {
        setBaseImage(profileImage);
        setBaseEmail(userEmail);
        setBaseName(userName);
        setBaseCategories(categories);
        setBaseBadge(showBadge);
        showToast('내 정보 수정이 완료되었습니다.', 'success');

        // 헤더 갱신 (저장 성공 시) - 강제로 로컬 스토어의 유저 정보 동기화
        const { updateUser } = useAuth.getState();
        updateUser({ nickname: userName, profileImg: profileImage });
      } else {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          showToast(errorData.message || '저장 중 오류가 발생했습니다.', 'error');
        } catch {
          showToast(`오류가 발생했습니다: ${res.status} ${errorText.substring(0, 50)}`, 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      if (res.ok) {
        showToast('계정이 안전하게 탈퇴 처리되었습니다.', 'success');
        router.push('/');
      } else {
        showToast('탈퇴 처리 중 오류가 발생했습니다.', 'error');
      }
    } catch (e) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
    setIsDeleteModalOpen(false);
  };

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
              <p className={styles.subtitle}>관심있는 카테고리를 선택해주세요. 맞춤 세션을 추천해 드립니다.</p>
            </div>
            <div className={styles.categoryPills}>
              {availableCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${tabsStyles.tabButton} ${tabsStyles.pillTab} ${categories.includes(cat.name) ? tabsStyles.pillTabActive : ''}`}
                  onClick={() => {
                    if (categories.includes(cat.name)) {
                      setCategories(categories.filter(c => c !== cat.name));
                    } else {
                      setCategories([...categories, cat.name]);
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
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
