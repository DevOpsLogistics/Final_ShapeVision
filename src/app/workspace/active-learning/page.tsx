"use client";

import styles from "./active.module.css";
import { User, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
interface QueueItem {
  id: string;
  imageUrl: string;
  prediction: { label: string; confidence: number };
  options: string[];
}

// SVG thumbnails for visual variety
const THUMBNAIL_SVGS: Record<string, React.ReactNode> = {
  "al-1": (
    <svg viewBox="0 0 100 100">
      <path d="M20,20 L80,22 L82,80 L18,78 Z" fill="none" stroke="#1c1b1b" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22,22 L78,20 L80,82 L20,80 Z" fill="none" stroke="#1c1b1b" strokeWidth="1" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
  "al-2": (
    <svg viewBox="0 0 100 100">
      <path d="M50,20 C75,20 85,45 80,70 C70,90 30,90 20,65 C10,40 25,20 50,20" fill="none" stroke="#1c1b1b" strokeWidth="2" />
    </svg>
  ),
  "al-3": (
    <svg viewBox="0 0 100 100">
      <path d="M50,20 L80,80 L20,80 Z" fill="none" stroke="#1c1b1b" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48,22 L82,78 L18,82 Z" fill="none" stroke="#1c1b1b" strokeWidth="1" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
};

function defaultSvg() {
  return (
    <svg viewBox="0 0 100 100">
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="#1c1b1b" strokeWidth="2" />
    </svg>
  );
}

export default function ActiveLearningWorkspace() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [contributions, setContributions] = useState(124);
  const [dailyGoal, setDailyGoal] = useState(80);
  const [page, setPage] = useState(1);
  const totalPages = 5;

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await fetch("/api/active-learning/queue");
      const data = await res.json();
      setQueue(data.queue || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  function selectLabel(caseId: string, label: string) {
    setSelectedLabels((prev) => ({ ...prev, [caseId]: label }));
    setOpenDropdown(null);
  }

  async function handleSubmitLabel(caseId: string) {
    const label = selectedLabels[caseId];
    if (!label) return;

    setSubmittingId(caseId);
    try {
      const res = await fetch("/api/active-learning/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, humanLabel: label }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompletedIds((prev) => new Set(prev).add(caseId));
        if (data.stats) {
          setContributions(data.stats.contributions);
          setDailyGoal(data.stats.dailyGoalProgress);
        }
      }
    } catch { /* ignore */ }
    setSubmittingId(null);
  }

  return (
    <div className={styles.workspace}>
      {/* Topbar */}
      

      <div className={styles.mainLayout}>
        {/* Left Column: Review Queue */}
        <main className={styles.leftCol}>
          <h1 className={styles.pageTitle}>Review Queue: Low-Confidence Recognition Cases</h1>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#5f6368" }}>
              Đang tải danh sách...
            </div>
          ) : (
            <div className={styles.queueList}>
              {queue.map((item) => {
                const isCompleted = completedIds.has(item.id);
                const isSubmitting = submittingId === item.id;
                
                return (
                  <div
                    className={styles.queueCard}
                    key={item.id}
                    style={{
                      opacity: isCompleted ? 0.5 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <div className={styles.thumbnail}>
                      <div className={styles.thumbnailSvg}>
                        {THUMBNAIL_SVGS[item.id] || defaultSvg()}
                      </div>
                    </div>
                    <div className={styles.predictionInfo}>
                      <div className={styles.predTitle}>{item.prediction.label}</div>
                      <div className={styles.predConf}>
                        (Confidence: {Math.round(item.prediction.confidence * 100)}%)
                      </div>
                    </div>
                    <div className={styles.dropdownContainer}>
                      <div
                        className={`${styles.dropdownBox} ${openDropdown === item.id ? styles.dropdownActive : ""}`}
                        onClick={() =>
                          !isCompleted &&
                          setOpenDropdown(openDropdown === item.id ? null : item.id)
                        }
                        style={{ cursor: isCompleted ? "default" : "pointer" }}
                      >
                        <span>
                          {isCompleted
                            ? `✓ ${selectedLabels[item.id]}`
                            : selectedLabels[item.id] || "Select Label đúng"}
                        </span>
                        {!isCompleted && <ChevronDown size={16} color="#5F6368" />}
                      </div>
                      {openDropdown === item.id && !isCompleted && (
                        <div className={styles.dropdownMenu}>
                          {item.options.map((opt) => (
                            <div
                              key={opt}
                              className={
                                selectedLabels[item.id] === opt
                                  ? styles.dropdownItemActive
                                  : styles.dropdownItem
                              }
                              onClick={() => selectLabel(item.id, opt)}
                              style={{ cursor: "pointer" }}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className={styles.submitBtn}
                      onClick={() => handleSubmitLabel(item.id)}
                      disabled={!selectedLabels[item.id] || isCompleted || isSubmitting}
                      style={{
                        opacity: !selectedLabels[item.id] || isCompleted ? 0.5 : 1,
                        cursor: !selectedLabels[item.id] || isCompleted ? "default" : "pointer",
                      }}
                    >
                      {isCompleted
                        ? "✓ Đã gửi"
                        : isSubmitting
                        ? "Đang gửi..."
                        : "Xác nhận & Gửi"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.pageText}>Page {page} of {totalPages}</span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* Right Column: Widgets */}
        <aside className={styles.rightCol}>
          {/* Widget 1: User Contribution Stats */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>User Contribution Stats</div>
            <div className={styles.widgetBody}>
              <div className={styles.statLarge}>Số lượt đóng góp: {contributions}</div>
              
              <div className={styles.progressHeader}>
                <span>Daily Goal ({dailyGoal}/100)</span>
                <span>{dailyGoal}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${dailyGoal}%`, transition: "width 0.5s ease" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Widget 2: Model Improvement Preview */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>Model Improvement Preview</div>
            <div className={styles.widgetBody}>
              <div className={styles.improvementViz}>
                <div className={styles.barChart}>
                  <div className={styles.barColumn}>
                    <div className={styles.barValueText} style={{ visibility: "hidden" }}>0</div>
                    <div className={styles.barBox} style={{ height: "60px", backgroundColor: "#e5e2e1" }}></div>
                    <div className={styles.barLabel}>Current Model</div>
                  </div>
                  <div className={styles.barColumn}>
                    <div className={styles.barValueTextHighlight}>+2.4%</div>
                    <div className={styles.barBox} style={{ height: "100px", backgroundColor: "#1A73E8" }}></div>
                    <div className={styles.barLabel}>Next Version</div>
                  </div>
                </div>

                <div className={styles.trendSection}>
                  <div className={styles.trendLabel}>Accuracy<br/>Improvement</div>
                  <div className={styles.trendSvgContainer}>
                    <svg viewBox="0 0 100 50" className={styles.trendSvg}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#1A73E8" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,40 L30,20 L60,30 L100,5" fill="none" stroke="#1A73E8" strokeWidth="2" />
                      <path d="M0,40 L30,20 L60,30 L100,5 L100,50 L0,50 Z" fill="url(#trendGradient)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
