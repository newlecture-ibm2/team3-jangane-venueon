import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/store/useAuthStore';

interface Category {
  id: number;
  name: string;
}

export function useProfile() {
  const { showToast } = useUIStore();
  const { logout } = useAuth();
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
          const fetchedEmail = data.email || '';
          const fetchedName = data.nickname || '';
          const rawImg = data.profileImg;
          const fetchedImg = rawImg
            ? (rawImg.startsWith('/') || rawImg.startsWith('http') ? rawImg : `/upload/${rawImg}`)
            : undefined;

          setBaseEmail(fetchedEmail);
          setBaseName(fetchedName);
          setBaseImage(fetchedImg);

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

  // 수정된 사항이 하나라도 있는지 확인
  const isDirty =
    profileImage !== baseImage ||
    userName !== baseName ||
    showBadge !== baseBadge ||
    JSON.stringify(categories.sort()) !== JSON.stringify(baseCategories.sort());

  const handleImageChangeClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadConfirm = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
      setProfileImage(URL.createObjectURL(file));
    }
    setIsUploadModalOpen(false);
  };

  const handleDeleteImage = () => {
    if (profileImage && profileImage.startsWith('blob:')) {
      URL.revokeObjectURL(profileImage);
    }
    setSelectedFile(null);
    setProfileImage(undefined);
  };

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

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

  const handleSave = async () => {
    try {
      let finalProfileImg: string | null = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', 'profile');

        const uploadRes = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          showToast('이미지 업로드에 실패했습니다.', 'error');
          return;
        }

        const uploadData = await uploadRes.json();
        finalProfileImg = uploadData.data?.filePath || uploadData.filePath || null;
      } else if (profileImage && !profileImage.startsWith('blob:')) {
        finalProfileImg = profileImage.replace(/^\/upload\//, '');
      } else {
        finalProfileImg = null;
      }

      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: userName,
          profileImg: finalProfileImg,
          categories: categories,
          showBadge: showBadge,
        }),
      });

      if (res.ok) {
        const displayImg = finalProfileImg ? `/upload/${finalProfileImg}` : undefined;

        setBaseImage(displayImg);
        setProfileImage(displayImg);
        setSelectedFile(null);
        setBaseEmail(userEmail);
        setBaseName(userName);
        setBaseCategories(categories);
        setBaseBadge(showBadge);
        showToast('내 정보 수정이 완료되었습니다.', 'success');

        const { updateUser } = useAuth.getState();
        updateUser({ nickname: userName, profileImg: displayImg });

        await fetch('/api/auth/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: userName, profileImg: finalProfileImg }),
        });
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
        await logout();
        router.push('/');
      } else {
        showToast('탈퇴 처리 중 오류가 발생했습니다.', 'error');
      }
    } catch (e) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
    setIsDeleteModalOpen(false);
  };

  const toggleCategory = (catName: string) => {
    if (categories.includes(catName)) {
      setCategories(categories.filter(c => c !== catName));
    } else {
      setCategories([...categories, catName]);
    }
  };

  return {
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
  };
}
