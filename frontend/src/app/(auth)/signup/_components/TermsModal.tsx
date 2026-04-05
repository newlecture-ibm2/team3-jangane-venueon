import React from "react";
import Checkbox from "@/components/ui/Checkbox";
import styles from "./TermsModal.module.css";

export type TermType = "termsOfService" | "privacyPolicy";

interface TermsModalProps {
  type: TermType;
  isOpen: boolean;
  isChecked: boolean;
  onClose: () => void;
  onAgree: (type: TermType) => void;
}

const TERMS_DATA = {
  termsOfService: {
    title: "이용약관 동의",
    sections: [
      {
        heading: "제1조 (목적)",
        body: [
          "본 약관은 VenueOn(이하 '회사'라 합니다)가 제공하는 제반 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다."
        ]
      },
      {
        heading: "제2조 (회원의 의무)",
        body: [
          "1. 회원은 회사의 서비스를 이용함에 있어 불법적인 행위를 해서는 안 됩니다.",
          "2. 다른 회원의 서비스 이용을 방해하거나, 일방적인 혐오 발언 등 운영 원칙에 위배되는 행동을 금지합니다.",
          "3. 회원은 회원가입 시 허위 정보를 기재해서는 안 되며, 자신의 정보가 변경되었을 경우 즉시 수정해야 합니다."
        ]
      },
      {
        heading: "제3조 (서비스의 변경 및 중지)",
        body: [
          "회사는 서비스 향상을 위해 운영상의 필요에 따라 제공하고 있는 서비스의 퀄리티나 내용을 변경할 수 있으며, 이로 인해 회원에게 발생하는 손해에 대해서는 책임지지 않습니다."
        ]
      }
    ]
  },
  privacyPolicy: {
    title: "개인정보 처리방침 동의",
    sections: [
      {
        heading: "1. 수집하는 개인정보 항목",
        body: [
          "회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 안전하게 수집하고 있습니다.",
          "- 필수 수집항목: 이메일, 이름, 비밀번호",
          "- 자동차단 수집항목: IP 주소, 쿠키 등 브라우저 환경 데이터"
        ]
      },
      {
        heading: "2. 개인정보의 수집 및 이용목적",
        body: [
          "회사는 수집한 개인정보를 다음의 핵심 목적을 위해 엄격히 활용합니다.",
          "- 서비스 제공에 관한 계약 이행 및 요금 정산 (티켓 구매 등)",
          "- 회원제 서비스 이용에 따른 본인확인 및 개인 식별",
          "- 불량회원의 부정 이용 방지와 비인가 사용 방지"
        ]
      },
      {
        heading: "3. 개인정보의 보유 및 이용기간",
        body: [
          "원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 안전하게 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다."
        ]
      }
    ]
  }
};

export default function TermsModal({ type, isOpen, isChecked, onClose, onAgree }: TermsModalProps) {
  if (!isOpen) return null;

  const data = TERMS_DATA[type];

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onAgree(type);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{data.title}</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {data.sections.map((section, idx) => (
            <div key={idx} className={styles.termSection}>
              <h4 className={styles.termHeading}>{section.heading}</h4>
              {section.body.map((paragraph, pIdx) => (
                <p key={pIdx} className={styles.termParagraph}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.modalFooter}>
          <Checkbox
            checked={isChecked}
            onChange={handleCheckboxChange}
            label={<span className={styles.footerLabel}>위 약관에 모두 동의합니다.</span>}
          />
        </div>
      </div>
    </div>
  );
}
