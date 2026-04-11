'use client';

import React, { useEffect, useState } from 'react';
import styles from './RequestDetailModal.module.css';
import { ModalOverlay, ModalCard } from '@/components/modal';
import { Button, Tag, TextareaField, UserProfile } from '@/components/ui';
import StatusTag from '@/components/ui/StatusTag';
import { UploadIcon } from '@/components/icons';
import { useUIStore } from '@/store/useUIStore';
import {
  CATEGORY_LABELS,
  type AdminRequestDetail,
  type RequestStatus,
} from '@/lib/admin-request-api';

interface RequestDetailModalProps {
  isOpen: boolean;
  requestId: number | null;
  onClose: () => void;
  onUpdated: () => void;
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

// ── 더미 상세 데이터 (API 연동 전 UI 확인용, 나중에 제거) ──
const DUMMY_DETAIL: Record<number, AdminRequestDetail> = {
  1: {
    id: 1, requesterId: 10, requesterNickname: '김민수', requesterEmail: 'minsu@example.com',
    category: 'BUSINESS_LICENSE', status: 'PENDING',
    title: '[가입 심사] 테크캠프',
    content: '기관명: 테크캠프\n담당자명: 김민수\n사업자등록번호: 123-45-67890',
    attachmentUrl: '/upload/business_license_sample.pdf',
    adminComment: null, processedBy: null,
    createdAt: '2026-04-10T09:30:00', processedAt: null,
  },
  2: {
    id: 2, requesterId: 11, requesterNickname: '이지은', requesterEmail: 'jieun@example.com',
    category: 'USER_INQUIRY', status: 'PENDING',
    title: '결제 후 수강 목록에 표시되지 않는 문제',
    content: '4월 9일에 "Spring Boot 마스터 클래스"를 결제했는데,\n마이페이지 > 내 세션 목록에 나타나지 않습니다.\n\n주문번호: venueon_order_245_1680000000\n결제 금액: 85,000원',
    attachmentUrl: null, adminComment: null, processedBy: null,
    createdAt: '2026-04-09T14:20:00', processedAt: null,
  },
  4: {
    id: 4, requesterId: 13, requesterNickname: '최서연', requesterEmail: 'seoyeon@example.com',
    category: 'HOST_INQUIRY', status: 'REJECTED',
    title: '커뮤니티 개설 조건에 대해 문의합니다',
    content: '커뮤니티 개설을 하고 싶은데, 뱃지 보유 조건이 필수인가요?\n뱃지 없이도 개설할 수 있는 방법이 있을까요?',
    attachmentUrl: null,
    adminComment: '현재 커뮤니티 개설은 관련 이벤트 뱃지 보유자만 가능합니다. 먼저 이벤트에 참여해주세요.',
    processedBy: 1, createdAt: '2026-04-07T16:45:00', processedAt: '2026-04-08T09:30:00',
  },
  5: {
    id: 5, requesterId: 14, requesterNickname: '정도윤', requesterEmail: 'doyoon@example.com',
    category: 'HOST_INQUIRY', status: 'PENDING',
    title: '사업자등록증 재업로드 요청',
    content: '이전에 업로드했던 사업자등록증이 만료되어 신규 발급본을 첨부합니다.\n확인 부탁드립니다.',
    attachmentUrl: '/upload/license_doyoon_new.pdf',
    adminComment: null, processedBy: null,
    createdAt: '2026-04-11T08:15:00', processedAt: null,
  },
  6: {
    id: 6, requesterId: 15, requesterNickname: null, requesterEmail: 'guest@example.com',
    category: 'OTHER', status: 'COMPLETED',
    title: '계정 이메일 변경 요청',
    content: '기존 이메일(guest@old.com)에서 guest@example.com으로 변경 부탁드립니다.',
    attachmentUrl: null,
    adminComment: '이메일 변경 처리 완료했습니다.',
    processedBy: 1, createdAt: '2026-04-06T13:00:00', processedAt: '2026-04-07T11:20:00',
  },
  7: {
    id: 7, requesterId: 16, requesterNickname: '한소희', requesterEmail: 'sohee@example.com',
    category: 'USER_INQUIRY', status: 'PENDING',
    title: '이벤트 썸네일 이미지가 깨져서 표시됩니다',
    content: '"React 심화 과정" 이벤트의 썸네일 이미지가 404 에러로 표시되지 않습니다.\n이벤트 ID: 42',
    attachmentUrl: '/upload/screenshot_broken_thumb.png',
    adminComment: null, processedBy: null,
    createdAt: '2026-04-11T10:30:00', processedAt: null,
  },
};
// ── 더미 데이터 끝 ──

export default function RequestDetailModal({
  isOpen,
  requestId,
  onClose,
  onUpdated,
}: RequestDetailModalProps) {
  const [detail, setDetail] = useState<AdminRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { showToast } = useUIStore();

  useEffect(() => {
    if (!isOpen || !requestId) {
      setDetail(null);
      setAdminComment('');
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      // TODO: API 연동 시 adminRequestAPI.getRequestDetail(requestId)로 교체
      await new Promise((r) => setTimeout(r, 200));
      const dummy = DUMMY_DETAIL[requestId] || null;
      setDetail(dummy);
      setIsLoading(false);
    };

    fetchDetail();
  }, [isOpen, requestId]);

  const handleApprove = async () => {
    if (!detail) return;
    setIsProcessing(true);
    try {
      // TODO: API 연동 시 adminRequestAPI.approveRequest()로 교체
      await new Promise((r) => setTimeout(r, 300));
      showToast('요청 처리 및 승인이 완료되었습니다.', 'success');
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
      // TODO: API 연동 시 adminRequestAPI.rejectRequest()로 교체
      await new Promise((r) => setTimeout(r, 300));
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
          <h2 className={styles.modalTitle}>요청 상세</h2>
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
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>요청자</span>
                  <div className={styles.metaValue}>
                    <UserProfile
                      name={detail.requesterNickname || detail.requesterEmail || '알 수 없음'}
                      size="medium"
                    />
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>요청일</span>
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
                  <a
                    href={detail.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileChip}
                  >
                    <div className={styles.fileChipIcon}>
                      <UploadIcon />
                    </div>
                    <span className={styles.fileChipText}>
                      {detail.attachmentUrl.split('/').pop() || '첨부파일'}
                    </span>
                  </a>
                </div>
              )}

              {/* 어드민 코멘트 (이미 처리된 경우 읽기 전용) */}
              {(detail.status === 'COMPLETED' || detail.status === 'REJECTED') && detail.adminComment && (
                <div className={styles.adminCommentSection}>
                  <span className={styles.metaLabel}>어드민 코멘트</span>
                  <p className={styles.adminCommentText}>{detail.adminComment}</p>
                </div>
              )}

              {/* 처리 영역 (대기 중 / 검토 중일 때만) */}
              {(detail.status === 'PENDING' || detail.status === 'REVIEWING') && (
                <div className={styles.actionSection}>
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
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      거절
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      승인
                    </Button>
                  </div>
                </div>
              )}
          </>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}
