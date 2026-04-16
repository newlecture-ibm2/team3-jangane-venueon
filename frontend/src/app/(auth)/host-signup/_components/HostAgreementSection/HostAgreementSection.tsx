"use client";

import React, { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import TermsModal, { TermType as HostTermType } from "../../../_components/TermsModal";
import styles from "./HostAgreementSection.module.css";

export interface HostAgreementState {
  termsOfService: boolean;   // [필수] 이용약관
  privacyPolicy: boolean;    // [필수] 개인정보 처리방침
  hostTerms: boolean;        // [필수] 호스트 이용약관
}

interface HostAgreementSectionProps {
  agreements: HostAgreementState;
  onChange: (agreements: HostAgreementState) => void;
}

/** 호스트 필수 약관이 모두 체크되었는지 확인 */
export function isHostRequiredAgreed(agreements: HostAgreementState): boolean {
  return agreements.termsOfService && agreements.privacyPolicy && agreements.hostTerms;
}

export default function HostAgreementSection({ agreements, onChange }: HostAgreementSectionProps) {
  const [modalType, setModalType] = useState<HostTermType | null>(null);

  const allChecked = agreements.termsOfService && agreements.privacyPolicy && agreements.hostTerms;

  const handleAllChange = () => {
    const next = !allChecked;
    onChange({
      termsOfService: next,
      privacyPolicy: next,
      hostTerms: next,
    });
  };

  const handleSingleChange = (key: keyof HostAgreementState) => {
    onChange({
      ...agreements,
      [key]: !agreements[key],
    });
  };

  const handleAgreeInModal = (type: HostTermType) => {
    onChange({
      ...agreements,
      [type]: true,
    });
    setModalType(null);
  };

  return (
    <>
      <div className={styles.agreementSection}>
        <div className={styles.allAgree}>
          <Checkbox
            checked={allChecked}
            onChange={handleAllChange}
            label={<span className={styles.allAgreeLabel}>전체 약관 동의</span>}
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
            >
              보기
            </button>
          </div>

          <div className={styles.agreementItem}>
            <Checkbox
              checked={agreements.hostTerms}
              onChange={() => handleSingleChange("hostTerms")}
              label={
                <span className={styles.itemLabel}>
                  호스트 이용약관 동의
                  <span className={styles.requiredBadge}>(필수)</span>
                </span>
              }
            />
            <button
              type="button"
              className={styles.viewLink}
              onClick={() => setModalType("hostTerms")}
            >
              보기
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        type={modalType || "termsOfService"}
        isOpen={modalType !== null}
        isChecked={modalType ? agreements[modalType] : false}
        onClose={() => setModalType(null)}
        onAgree={handleAgreeInModal}
      />
    </>
  );
}
