"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, X } from 'lucide-react';
import { Button, InputField, TextareaField, SelectBox } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import styles from './EventForm.module.css';
import { useUIStore } from '@/store/useUIStore';
import Image from 'next/image';

export default function EventForm() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    date: '',
    isOnlineStr: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    // 이미지 파일 유형 검증
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }
    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      showToast('파일 크기는 5MB 이하여야 합니다.', 'error');
      return;
    }

    // 미리보기 즉시 표시
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'lecture-thumbnail');

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('업로드 실패');

      const data = await res.json();
      setThumbnailUrl(data.data.filePath);
      showToast('이미지가 업로드되었습니다.', 'success');
    } catch (err) {
      showToast('이미지 업로드에 실패했습니다.', 'error');
      setPreviewUrl(null);
      setThumbnailUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setThumbnailUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    try {
      const isOnline = formData.isOnlineStr === 'true';
      
      // 날짜 파싱 (임시로 시작일 10시, 종료일 18시 셋팅)
      let startDateStr = new Date().toISOString();
      let endDateStr = new Date().toISOString();
      if (formData.date) {
        startDateStr = `${formData.date}T10:00:00`;
        endDateStr = `${formData.date}T18:00:00`;
      }

      // API 요청
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: 1, // 테스트용 하드코딩
          title: formData.title || '새 이벤트',
          description: formData.description,
          type: 'SEMINAR', // 기본값
          location: formData.location,
          isOnline: isOnline,
          price: parseInt(formData.price || '0', 10),
          maxAttendees: 50,
          thumbnailUrl: thumbnailUrl,
          startDate: startDateStr,
          endDate: endDateStr,
        })
      });

      if (!res.ok) throw new Error('이벤트 생성 실패');
      
      const resData = await res.json();
      const newEventId = resData.data.id;

      if (!isDraft) {
        // 바로 게시하기
        const publishRes = await fetch(`/api/events/${newEventId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PUBLISHED' })
        });
        if (!publishRes.ok) throw new Error('상태 변경 실패');
      }

      showToast(isDraft ? '임시 저장되었습니다.' : '이벤트가 성공적으로 게시되었습니다.', 'success');
      router.push(`/events`);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← 강의 목록 보기
      </button>

      <div className={styles.formGroup}>
        <label className={styles.label}>강의 제목</label>
        <input 
          type="text" 
          name="title"
          className={styles.titleInput} 
          placeholder="제목을 입력하세요." 
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>강의 이미지</label>
        {previewUrl ? (
          <div className={styles.previewWrapper}>
            <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
            {uploading && <div className={styles.uploadingOverlay}>업로드 중...</div>}
            <button className={styles.removeImageBtn} onClick={handleRemoveImage} type="button">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { setIsDragOver(false); handleDrop(e); }}
          >
            <FileUp size={32} className={styles.uploadIcon} />
            <p>{isDragOver ? '여기에 놓으세요' : '클릭하거나 파일을 여기로 끌어다 놓으세요'}</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>강의 정보</label>
          <span className={styles.charCount}>{formData.description.length}/300</span>
        </div>
        <textarea 
          name="description"
          className={styles.textarea} 
          placeholder="강의 정보를 입력하세요."
          maxLength={300}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.grid3}>
        <div className={styles.formGroup}>
          <label className={styles.label}>총 가격</label>
          <div className={styles.priceInputWrapper}>
            <span className={styles.currencyIcon}>₩</span>
            <input 
              type="number" 
              name="price"
              className={styles.priceInput} 
              value={formData.price}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>날짜</label>
          <input 
            type="date" 
            name="date"
            className={styles.dateInput} 
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>온라인/오프라인</label>
          <select 
            name="isOnlineStr"
            className={styles.selectInput}
            value={formData.isOnlineStr}
            onChange={handleChange}
          >
            <option value="">옵션을 선택하세요.</option>
            <option value="false">오프라인</option>
            <option value="true">온라인</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>장소</label>
        <input 
          type="text" 
          name="location"
          className={styles.standardInput} 
          placeholder="오프라인 강의일 경우 주소를 입력해주세요." 
          value={formData.location}
          onChange={handleChange}
          disabled={formData.isOnlineStr === 'true'}
        />
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.hostSection}>
          <h3 className={styles.hostTitle}>주최자 정보</h3>
          <div className={styles.hostCard}>
            <div className={styles.hostLogo}></div>
            <div className={styles.hostInfo}>
              <h4 className={styles.hostName}>데이터마인드 크리에이티브</h4>
              <p className={styles.hostDesc}>
                데이터를 넘어 마케팅의 본질을 꿰뚫는 AI 전략 그룹으로 실무 마케터들의 AI 전환(AI Transformation) 가속화 및 실질적 생산성 도구 보급합니다.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actionButtonsContainer}>
          <div className={styles.actionButtonsRow}>
            <button 
              className={styles.draftBtn} 
              disabled={true}
              title="마이페이지 기능이 추가되면 지원될 예정입니다."
            >
              임시 저장
            </button>
            <button 
              className={styles.publishBtn} 
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              {loading ? '게시 중...' : '게시하기'}
            </button>
          </div>
          <button 
            className={styles.cancelBtn} 
            onClick={() => setIsExitModalOpen(true)}
            disabled={loading}
          >
            나가기
          </button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          setIsExitModalOpen(false);
          router.back();
        }}
        title="강의 작성을 중단하시겠습니까?"
        subtitle="지금 나가면 입력한 정보가 저장되지 않고 모두 삭제됩니다. 작성을 취소하시겠습니까?"
        status="danger"
        cancelText="계속 작성하기"
        confirmText="삭제"
      />
    </div>
  );
}
