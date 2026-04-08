import React from "react";
import Checkbox from "@/components/ui/Checkbox";
import styles from "./HostTermsModal.module.css";

export type HostTermType = "termsOfService" | "privacyPolicy" | "hostTerms";

interface HostTermsModalProps {
  type: HostTermType;
  isOpen: boolean;
  isChecked: boolean;
  onClose: () => void;
  onAgree: (type: HostTermType) => void;
}

const TERMS_DATA: Record<HostTermType, { title: string; sections: { heading: string; body: string[] }[] }> = {
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
          "- 호스트 추가 수집항목: 기관명, 담당자명, 사업자등록번호, 사업자등록증 이미지",
          "- 자동 수집항목: IP 주소, 쿠키 등 브라우저 환경 데이터"
        ]
      },
      {
        heading: "2. 개인정보의 수집 및 이용목적",
        body: [
          "회사는 수집한 개인정보를 다음의 핵심 목적을 위해 엄격히 활용합니다.",
          "- 서비스 제공에 관한 계약 이행 및 요금 정산",
          "- 회원제 서비스 이용에 따른 본인확인 및 개인 식별",
          "- 호스트 자격 심사 및 사업자 인증"
        ]
      },
      {
        heading: "3. 개인정보의 보유 및 이용기간",
        body: [
          "원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 안전하게 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다."
        ]
      }
    ]
  },
  hostTerms: {
    title: "호스트 이용약관 동의",
    sections: [
      {
        heading: "제1조 (호스트의 정의)",
        body: [
          "호스트란 VenueOn 플랫폼을 통해 공연, 전시, 세션 등의 행사를 등록하고 티켓을 판매하는 사업자(개인 또는 법인)를 의미합니다."
        ]
      },
      {
        heading: "제2조 (호스트의 의무)",
        body: [
          "1. 호스트는 등록하는 행사 정보가 정확하고 사실에 부합함을 보장해야 합니다.",
          "2. 행사 취소 또는 변경 시 최소 3일 전에 구매자에게 통보해야 합니다.",
          "3. 호스트는 관련 법규를 준수하며, 유효한 사업자등록증을 보유해야 합니다.",
          "4. 허위 행사 등록, 부정 판매 등의 행위가 적발될 경우 즉시 자격이 정지됩니다."
        ]
      },
      {
        heading: "제3조 (수수료 및 정산)",
        body: [
          "1. 회사는 티켓 판매 금액의 일정 비율을 플랫폼 이용 수수료로 차감합니다.",
          "2. 정산은 행사 종료 후 영업일 기준 7일 이내에 호스트의 등록 계좌로 지급됩니다.",
          "3. 환불 발생 시 환불 금액 및 관련 수수료는 호스트 부담으로 합니다."
        ]
      },
      {
        heading: "제4조 (서비스 이용 제한)",
        body: [
          "회사는 호스트가 본 약관을 위반하거나, 서비스 운영에 심각한 지장을 초래하는 경우 사전 통보 후 호스트 자격을 일시 정지하거나 해지할 수 있습니다."
        ]
      }
    ]
  }
};

export default function HostTermsModal({ type, isOpen, isChecked, onClose, onAgree }: HostTermsModalProps) {
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
            label={<span className={styles.footerLabel}>위 약관에 동의합니다.</span>}
          />
        </div>
      </div>
    </div>
  );
}
