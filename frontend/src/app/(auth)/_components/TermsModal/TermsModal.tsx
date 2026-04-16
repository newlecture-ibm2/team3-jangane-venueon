import React from "react";
import Checkbox from "@/components/ui/Checkbox";
import { TERMS_DATA, TermType } from "./termsData";
import styles from "./TermsModal.module.css";

export type { TermType };

interface TermsModalProps {
  type: TermType;
  isOpen: boolean;
  isChecked: boolean;
  onClose: () => void;
  onAgree: (type: TermType) => void;
}

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
