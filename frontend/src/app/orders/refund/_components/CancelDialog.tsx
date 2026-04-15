import React, { useState } from 'react';
import styles from './CancelDialog.module.css';

const CANCEL_REASONS = [
  '일정이 변경되어 참석이 어렵습니다.',
  '다른 세션를 수강하고 싶습니다.',
  '단순 변심입니다.',
  '세션 내용이 기대와 달랐습니다.',
  '직접 입력',
];

interface OrderItem {
  orderId: number;
  eventId: number;
  eventTitle: string;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  orderedAt: string;
  paidAt: string | null;
}

interface CancelDialogProps {
  cancelTarget: OrderItem;
  cancelling: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function CancelDialog({
  cancelTarget,
  cancelling,
  onConfirm,
  onClose,
}: CancelDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const reason = selectedReason === '직접 입력' ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => !cancelling && onClose()}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.dialogTitle}>수강 취소</h2>
        <p className={styles.dialogSubtitle}>
          <strong>{cancelTarget.eventTitle}</strong>의 수강을 취소하시겠어요?<br />
          취소 사유를 선택해 주세요.
        </p>

        <div className={styles.reasonOptions}>
          {CANCEL_REASONS.map((reason) => (
            <label
              key={reason}
              className={`${styles.reasonOption} ${selectedReason === reason ? styles.reasonOptionSelected : ''}`}
            >
              <input
                type="radio"
                name="cancelReason"
                className={styles.reasonRadio}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
              {reason}
            </label>
          ))}
        </div>

        {selectedReason === '직접 입력' && (
          <input
            type="text"
            className={styles.customReasonInput}
            placeholder="취소 사유를 직접 입력해 주세요"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}

        <div className={styles.dialogActions}>
          <button
            className={styles.dialogCancelBtn}
            onClick={onClose}
            disabled={cancelling}
          >
            돌아가기
          </button>
          <button
            className={styles.dialogConfirmBtn}
            onClick={handleConfirm}
            disabled={
              cancelling ||
              !selectedReason ||
              (selectedReason === '직접 입력' && !customReason.trim())
            }
          >
            {cancelling ? '처리 중...' : '환불 요청'}
          </button>
        </div>
      </div>
    </div>
  );
}
