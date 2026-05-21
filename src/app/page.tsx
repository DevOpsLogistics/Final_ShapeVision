"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import styles from "./page.module.css";
import OnboardingModal from "../components/OnboardingModal";

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const calculatorRef = useRef<any>(null);

  const initDesmos = () => {
    const elt = document.getElementById('desmos-calculator');
    if (elt && (window as any).Desmos && !calculatorRef.current) {
      calculatorRef.current = (window as any).Desmos.GraphingCalculator(elt, { 
        expressions: false, 
        settingsMenu: false,
        zoomButtons: false,
        lockViewport: true,
        xAxisNumbers: false,
        yAxisNumbers: false,
        invertedColors: false
      });
      
      const calc = calculatorRef.current;
      
      // Initial variables
      calc.setExpression({ id: 'a', latex: 'a=5' });
      calc.setExpression({ id: 'b', latex: 'b=4' });
      calc.setExpression({ id: 'c_list', latex: 'c=[-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1]' });
      
      // Ghost waves
      calc.setExpression({ 
        id: 'ghost_waves', 
        latex: 'y=c\\cdot a\\cdot \\sin(\\frac{\\pi}{b}x)', 
        color: '#888888',
        lineWidth: 1.5
      });
      
      // Main wave
      calc.setExpression({ 
        id: 'main_wave', 
        latex: 'y=a\\cdot \\sin(\\frac{\\pi}{b}x)', 
        color: '#1a73e8', // True blue
        lineWidth: 4
      });
      
      // Draggable points
      calc.setExpression({ 
        id: 'p_amplitude', 
        latex: '(\\frac{b}{2}, a)', 
        color: '#1a73e8',
        dragMode: (window as any).Desmos.DragModes.XY
      });
      
      calc.setExpression({ 
        id: 'p_period', 
        latex: '(b, 0)', 
        color: '#1a73e8',
        dragMode: (window as any).Desmos.DragModes.X
      });

      // Set viewport
      calc.setMathBounds({
        left: -1,
        right: 15,
        bottom: -10,
        top: 10
      });
    }
  };

  return (
    <div className={styles.container}>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>ShapeVision Workspace</h1>
            <p className={styles.description}>
              Công cụ trực quan hóa, phân tích thuộc tính và nhận diện hình học bằng Neural Network.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/workspace/draw" className={styles.primaryButton}>
                Mở Workspace
              </Link>
              <button onClick={() => setShowOnboarding(true)} className={styles.secondaryButton}>
                Tài liệu hướng dẫn
              </button>
            </div>
          </div>
          
          <div className={styles.heroImage} style={{ marginTop: '40px' }}>
            {/* Desmos Calculator Container */}
            <div 
              id="desmos-calculator" 
              style={{ 
                width: '100%', 
                height: '400px', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            ></div>
            <Script 
              src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
              onReady={initDesmos}
            />
          </div>
        </div>
        
        {/* White wave at the bottom */}
        <div className={styles.waveContainer}>
          <svg className={styles.wave} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,320L0,160C360,320,1080,0,1440,160L1440,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2>Tính năng nổi bật</h2>
          <div className={styles.underline}></div>
        </div>

        <div className={styles.featuresGrid}>
          <Link href="/dashboard" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.featureCard} style={{ height: '100%' }}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
              </div>
              <div className={styles.featureText}>
                <h3>Canvas tương tác</h3>
                <p>Vẽ và nhận diện trực tiếp các hình khối trên trình duyệt</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.featureCard} style={{ height: '100%' }}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div className={styles.featureText}>
                <h3>Phân tích ảnh tải lên</h3>
                <p>Nhận diện đa vật thể với độ chính xác cao từ ảnh</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.featureCard} style={{ height: '100%' }}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              <div className={styles.featureText}>
                <h3>Camera quét Real-time</h3>
                <p>Theo dõi và nhận diện hình học qua webcam với FPS cao</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.featureCard} style={{ height: '100%' }}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <div className={styles.featureText}>
                <h3>Nhận diện đa đối tượng</h3>
                <p>Hệ thống chia cắt (segmentation) và đếm hình khối</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.featureCard} style={{ height: '100%' }}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div className={styles.featureText}>
                <h3>Mô hình hóa 3D</h3>
                <p>Phân tích khối lập phương và hình trụ đa chiều</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.featureCard} style={{ height: '100%' }}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div className={styles.featureText}>
                <h3>Toán học nâng cao</h3>
                <p>Tích hợp thuật toán tính diện tích, thể tích tự động</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
