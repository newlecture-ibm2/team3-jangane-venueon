'use client';

import React, { useEffect, useState } from 'react';
import styles from './ContactDetailModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { Button, FilePreviewList, TextareaField, UserProfile } from '@/components/ui';
import StatusTag from '@/components/ui/StatusTag';
import { useUIStore } from '@/store/useUIStore';
import {
  userContactAPI,
  adminContactAPI,
  CATEGORY_LABELS,
  type ContactDetail,
} from '@/lib/contact-api';

export interface ContactDetailModalProps {
  isOpen: boolean;
  contactId: number | null;
  onClose: () => void;
  onUpdated: () => void;
  role?: 'admin' | 'viewer'; // 'admin'이면 관리자 처리 기능 활성화, 'viewer'면 단순 조회/취소
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContactDetailModal({
  isOpen,
  contactId,
  onClose,
  onUpdated,
  role = 'viewer',
}: ContactDetailModalProps) {
  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminComment, setAdminComment] = useState('');

  const { showToast } = useUIStore();

  useEffect(() => {
    if (!isOpen || !contactId) {
      setDetail(null);
      setAdminComment('');
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = role === 'admin'
          ? await adminContactAPI.getContactDetail(contactId)
          : await userContactAPI.getMyContactDetail(contactId);
        setDetail(res.data);
      } catch (error) {
        console.error('Failed to fetch contact detail:', error);
        setDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, contactId, role]);

  const handleCancelContact = async () => {
    if (!detail) return;
    setIsProcessing(true);
    try {
      await userContactAPI.cancelContact(detail.id);
      showToast('문의가 취소되었습니다.', 'success');
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('취소 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setIsProcessing(true);
    try {
      await adminContactAPI.approveContact(detail.id, adminComment || undefined);
      showToast('처리가 완료되었습니다.', 'success');
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    if (!adminComment.trim()) {
      showToast('거절 사유를 입력해주세요.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      await adminContactAPI.rejectContact(detail.id, adminComment);
      showToast('성공적으로 반려되었습니다.', 'success');
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('반려 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="md">
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.modalTitle}>문의 상세</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {isLoading || !detail ? (
          <div className={styles.loadingState}>불러오는 중...</div>
        ) : (
          <>
            {/* 제목 + 내용 */}
            <div className={styles.contentSection}>
              <h3 className={styles.requestTitle}>{detail.title}</h3>
              {detail.content && (
                <p className={styles.requestContent}>{detail.content}</p>
              )}
            </div>

            {/* 메타 정보 */}
            <div className={styles.metaSection}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>카테고리</span>
                <span className={styles.metaValue}>{CATEGORY_LABELS[detail.category]}</span>
              </div>
              
              {role === 'admin' && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>작성자</span>
                  <div className={styles.metaValue}>
                    <UserProfile
                      name={detail.requesterNickname || detail.requesterEmail || '알 수 없음'}
                      imageUrl={detail.requesterProfileImg
                        ? (detail.requesterProfileImg.startsWith('/') || detail.requesterProfileImg.startsWith('http')
                          ? detail.requesterProfileImg
                          : `/upload/${detail.requesterProfileImg}`)
                        : undefined}
                      size="medium"
                    />
                  </div>
                </div>
              )}

              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>문의일</span>
                <span className={styles.metaValue}>{formatDateTime(detail.createdAt)}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>상태</span>
                <StatusTag domain="report" status={detail.status} />
              </div>
              {detail.processedAt && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>처리일</span>
                  <span className={styles.metaValue}>{formatDateTime(detail.processedAt)}</span>
                </div>
              )}
            </div>

            {/* 첨부파일 */}
            {detail.attachmentUrl && (
              <div className={styles.attachmentSection}>
                <span className={styles.metaLabel}>첨부파일</span>
                <FilePreviewList
                  files={detail.attachmentUrl.split(',').map((url) => {
                    const trimmedUrl = url.trim();
                    const fullUrl = (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('http')) 
                      ? trimmedUrl 
                      : `/upload/${trimmedUrl}`;
                    return {
                      name: trimmedUrl.split('/').pop() || '첨부파일',
                      size: 0,
                      url: fullUrl,
                    };
                  })}
                  onClickFile={(file) => window.open(file.url, '_blank')}
                />
              </div>
            )}

            {/* 어드민 답변 (이미 처리된 경우 읽기 전용) */}
            {(detail.status === 'COMPLETED' || detail.status === 'REJECTED') && detail.adminComment && (
              <div className={styles.adminCommentSection}>
                <span className={styles.metaLabel}>관리자 답변</span>
                <p className={styles.adminCommentText}>{detail.adminComment}</p>
              </div>
            )}

            {/* 처리 영역 - 어드민용 (대기 중 / 검토 중일 때만) */}
            {role === 'admin' && (detail.status === 'PENDING' || detail.status === 'REVIEWING') && (
              <>
                <TextareaField
                  label="코멘트"
                  placeholder="승인/거절 시 전달할 코멘트를 입력하세요. 거절 시 필수입니다."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={3}
                  showCount
                />
                <div className={styles.actionButtons}>
                  <Button
                    variant="danger"
                    style={{ flex: 1, padding: 0 }}
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    거절
                  </Button>
                  <Button
                    variant="primary"
                    style={{ flex: 1, padding: 0 }}
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    승인
                  </Button>
                </div>
              </>
            )}

            {/* 하단 버튼 - 뷰어용 (단순 읽기 혹은 취소) */}
            {role === 'viewer' && (
              <div className={styles.actionButtons}>
                <Button
                  variant="secondary"
                  style={{ flex: 1, padding: 0 }}
                  onClick={onClose}
                >
                  닫기
                </Button>
                {(detail.status === 'PENDING' || detail.status === 'REVIEWING') && (
                  <Button
                    variant="danger"
                    style={{ flex: 1, padding: 0 }}
                    onClick={handleCancelContact}
                    disabled={isProcessing}
                  >
                    문의 취소
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}
