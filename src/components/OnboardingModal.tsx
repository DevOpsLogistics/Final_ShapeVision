"use client";

import { useState } from "react";
import { PenTool, Image as ImageIcon, Camera, Box, Check, X } from "lucide-react";
import styles from "./OnboardingModal.module.css";
import { useRouter } from "next/navigation";

export default function OnboardingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const router = useRouter();

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    onClose();
    router.push("/workspace/draw");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Close Button on Step 2 and 3 usually, or just step 2 according to image */}
        {step > 1 && step < 3 && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} color="#5F6368" />
          </button>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className={styles.stepContainer}>
            <div className={styles.graphic}>
              <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Grid */}
                <path d="M20 40H140M20 60H140M20 80H140M20 100H140M20 120H140" stroke="#E8EAED" strokeWidth="1" />
                <path d="M40 20V140M60 20V140M80 20V140M100 20V140M120 20V140" stroke="#E8EAED" strokeWidth="1" />
                
                {/* Axes */}
                <path d="M80 20V140" stroke="#5F6368" strokeWidth="1.5" />
                <path d="M20 80H140" stroke="#5F6368" strokeWidth="1.5" />
                
                {/* Circle */}
                <circle cx="80" cy="80" r="40" stroke="#1A73E8" strokeWidth="2" fill="transparent" />
                
                {/* Pencil (angled) */}
                <g transform="translate(80, 80) rotate(-45) translate(-10, -50)">
                  <path d="M10 50L5 35L20 35L15 50Z" fill="#1A1A1A" />
                  <rect x="5" y="10" width="15" height="25" fill="#D2E3FC" stroke="#1A73E8" strokeWidth="1.5" />
                  <rect x="5" y="0" width="15" height="10" fill="#E8EAED" stroke="#5F6368" strokeWidth="1.5" />
                </g>
              </svg>
            </div>
            
            <h2 className={styles.title}>Chào mừng bạn đến với ShapeVision</h2>
            <p className={styles.description}>Khám phá sức mạnh của AI trong việc nhận diện và phân tích hình học.</p>
            
            <div className={styles.footerOptions}>
              <button className={styles.skipButton} onClick={handleFinish}>Bỏ qua</button>
              
              <div className={styles.dots}>
                <span className={`${styles.dot} ${styles.activeDot}`}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
              
              <button className={styles.primaryButton} onClick={handleNext}>Tiếp theo</button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className={styles.stepContainer}>
            <h2 className={styles.titleBlue}>Đa dạng công cụ phân tích</h2>
            <p className={styles.description}>Từ vẽ tay, upload ảnh đến camera real-time và mô hình không gian 3D.</p>
            
            <div className={styles.iconsRow}>
              <div className={styles.iconBox}><PenTool size={36} color="#1A73E8" strokeWidth={1.5} /></div>
              <div className={styles.iconBox}><ImageIcon size={36} color="#1A73E8" strokeWidth={1.5} /></div>
              <div className={styles.iconBox}><Camera size={36} color="#1A73E8" strokeWidth={1.5} /></div>
              <div className={styles.iconBox}><Box size={36} color="#1A73E8" strokeWidth={1.5} /></div>
            </div>
            
            <div className={styles.footerOptions}>
              <button className={styles.secondaryButton} onClick={handleBack}>Quay lại</button>
              
              <div className={styles.dots}>
                <span className={styles.dot}></span>
                <span className={`${styles.dot} ${styles.activeDot}`}></span>
                <span className={styles.dot}></span>
              </div>
              
              <button className={styles.primaryButton} onClick={handleNext}>Tiếp theo</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className={styles.stepContainer}>
            <div className={styles.graphicCheck}>
              <div className={styles.circleCheck}>
                <Check size={40} color="#FFFFFF" strokeWidth={3} />
              </div>
            </div>
            
            <h2 className={styles.title}>Sẵn sàng bắt đầu?</h2>
            <p className={styles.description}>Hãy thử vẽ một hình khối đầu tiên hoặc tham gia thử thách Quiz để rèn luyện kỹ năng.</p>
            
            <div className={styles.dotsCenter}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={`${styles.dot} ${styles.activeDot}`}></span>
            </div>
            
            <button className={styles.fullButton} onClick={handleFinish}>Bắt đầu ngay</button>
          </div>
        )}
      </div>
    </div>
  );
}
