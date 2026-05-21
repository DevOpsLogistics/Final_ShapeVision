"use client";

import { useState } from "react";
import OnboardingModal from "../../components/OnboardingModal";
import Link from "next/link";
import styles from "./workspace.module.css";

export default function WorkspacePage() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div className={styles.workspaceContainer}>
      

      <main className={styles.mainContent}>
        {/* Placeholder UI matching the background of Image 6 */}
        <div className={styles.heroBanner}>
          <div className={styles.bannerText}>
            <h1>Học tập cùng ShapeVision</h1>
            <p>Hãy thử vẽ một hình khối cơ bản hoặc tham gia thử thách Quiz để rèn luyện kỹ năng.</p>
            <button className={styles.primaryButton}>Bắt đầu ngay</button>
          </div>
          <div className={styles.bannerGraphics}>
            {/* Abstract geometric background elements */}
          </div>
        </div>

        <div className={styles.cardsGrid}>
          <Link href="/workspace/draw" className={styles.card} style={{textDecoration: 'none', color: 'inherit'}}>
            <div className={styles.cardIcon}>✏️</div>
            <div className={styles.cardText}>
              <h3>Học thử vẽ</h3>
              <p>Hãy thử vẽ một hình khối học tập.</p>
            </div>
          </Link>
          <Link href="/workspace/quiz" className={styles.card} style={{textDecoration: 'none', color: 'inherit'}}>
            <div className={styles.cardIcon}>🏆</div>
            <div className={styles.cardText}>
              <h3>Thử thách trực tuyến</h3>
              <p>Tham gia giải đố cùng cộng đồng.</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Onboarding Modal Overlay */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
