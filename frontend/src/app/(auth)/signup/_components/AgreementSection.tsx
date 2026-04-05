"use client";

import React, { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import TermsModal, { TermType } from "./TermsModal";
import styles from "./AgreementSection.module.css";

export interface AgreementState {
  termsOfService: boolean;   // [필수] 이용약관
  privacyPolicy: boolean;    // [필수] 개인정보 처리방침
}

interface AgreementSectionProps {
  agreements: AgreementState;
  onChange: (agreements: AgreementState) => void;
}

/** 필수 약관이 모두 체크되었는지 확인 */
export function isRequiredAgreed(agreements: AgreementState): boolean {
  return agreements.termsOfService && agreements.privacyPolicy;
}

export default function AgreementSection({ agreements, onChange }: AgreementSectionProps) {
  const [modalType, setModalType] = useState<TermType | null>(null);

  const allChecked = agreements.termsOfService && agreements.privacyPolicy;

  const handleAllChange = () => {
    const next = !allChecked;
    onChange({
      termsOfService: next,
      privacyPolicy: next,
    });
  };

  const handleSingleChange = (key: keyof AgreementState) => {
    onChange({
      ...agreements,
      [key]: !agreements[key],
    });
  };

  const handleAgreeInModal = (type: TermType) => {
    onChange({
      ...agreements,
      [type]: true,
    });
    setModalType(null); // 체크 시 모달 자동 닫힘
  };

  return (
    <>
      <div className={styles.agreementSection}>
        <div className={styles.allAgree}>
          <Checkbox
            checked={allChecked}
            onChange={handleAllChange}
            label={<span className={styles.allAgreeLabel}>이용약관 및 개인정보 처리방침 전체 동의</span>}
          />
        </div>

        <div className={styles.agreementList}>
          <div className={styles.agreementItem}>
            <Checkbox
              checked={agreements.termsOfService}
              onChange={() => handleSingleChange("termsOfService")}
              label={
                <span className={styles.itemLabel}>
                  이용약관 동의
                  <span className={styles.requiredBadge}>(필수)</span>
                </span>
              }
            />
            <button
              type="button"
              className={styles.viewLink}
              onClick={() => setModalType("termsOfService")}
              style={{ background: 'none', border: 'none' }}
            >
              보기
            </button>
          </div>

          <div className={styles.agreementItem}>
            <Checkbox
              checked={agreements.privacyPolicy}
              onChange={() => handleSingleChange("privacyPolicy")}
              label={
                <span className={styles.itemLabel}>
                  개인정보 처리방침 동의
                  <span className={styles.requiredBadge}>(필수)</span>
                </span>
              }
            />
            <button
              type="button"
              className={styles.viewLink}
              onClick={() => setModalType("privacyPolicy")}
              style={{ background: 'none', border: 'none' }}
            >
              보기
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        type={modalType || "termsOfService"} // Fallback to avoid null prop errors when closed
        isOpen={modalType !== null}
        isChecked={modalType ? agreements[modalType] : false}
        onClose={() => setModalType(null)}
        onAgree={handleAgreeInModal}
      />
    </>
  );
}
