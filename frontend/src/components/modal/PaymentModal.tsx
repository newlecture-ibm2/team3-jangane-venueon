'use client';

import React, { useState } from 'react';
import styles from './PaymentModal.module.css';
import ModalOverlay from './ModalOverlay';
import ModalCard from './ModalCard';
import { CancelIcon } from '@/components/icons';
import { Checkbox, Radio, InputField, Button } from '@/components/ui';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: any) => void;
  title: string;
  pricePerUnit: number; // 단가
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  pricePerUnit,
}: PaymentModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleMinus = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handlePlus = () => setQuantity((prev) => prev + 1);

  const totalPrice = pricePerUnit * quantity;

  // 세자리 콤마 포맷터
  const formatPrice = (num: number) => {
    return '₩' + num.toLocaleString('ko-KR');
  };

  const handleConfirm = () => {
    onConfirm({
      quantity,
      totalPrice,
      paymentMethod,
      cardNumber,
      expiry,
      cvc,
    });
  };

  const isConfirmDisabled = !isChecked || !cardNumber || !expiry || !cvc;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard size="sm">
        
        <div className={styles.textWrapper}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <CancelIcon style={{ cursor: 'pointer', color: 'var(--color-text-gray-500)', flex: 'none' }} onClick={onClose} />
        </div>

        <div className={styles.quantityWrapper}>
          <Button variant="secondary" className={styles.qtyBtn} onClick={handleMinus}>-</Button>
          <span className={styles.qtyValue}>{quantity}</span>
          <Button variant="secondary" className={styles.qtyBtn} onClick={handlePlus}>+</Button>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>총 결제 금액</span>
          <span className={styles.priceValue}>{formatPrice(totalPrice)}</span>
        </div>

        <div className={styles.paymentMethods}>
          <Radio 
            className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentOptionActive : styles.paymentOptionDefault}`}
            name="payment" 
            value="card" 
            checked={paymentMethod === 'card'} 
            onChange={(e) => setPaymentMethod(e.target.value)} 
            label={<span style={{ fontWeight: 700, fontSize: '14px' }}>신용카드</span>}
          />
          <Radio 
            className={`${styles.paymentOption} ${paymentMethod === 'transfer' ? styles.paymentOptionActive : styles.paymentOptionDefault}`}
            name="payment" 
            value="transfer" 
            checked={paymentMethod === 'transfer'} 
            onChange={(e) => setPaymentMethod(e.target.value)} 
            label={<span style={{ fontWeight: 700, fontSize: '14px' }}>계좌이체</span>}
          />
        </div>

        {paymentMethod === 'card' && (
          <div className={styles.inputGroup}>
            <InputField 
              label="카드 번호" 
              placeholder="0000-0000-0000-0000" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <div className={styles.inputRow}>
              <div className={styles.inputCol}>
                <InputField 
                  label="유효기간" 
                  placeholder="MM/YY" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div className={styles.inputCol}>
                <InputField 
                  label="CVC" 
                  placeholder="000" 
                  type="password"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.checkboxContainer}>
          <Checkbox 
            label="결제 내역 및 이용약관을 확인했습니다." 
            checked={isChecked} 
            onChange={(e) => setIsChecked(e.target.checked)} 
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button 
            variant="primary"
            style={{ flex: 1, padding: 0 }}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            결제하기
          </Button>
        </div>

            </ModalCard>
    </ModalOverlay>
  );
}
