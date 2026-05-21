"use client";

import styles from "./quiz.module.css";
import { Clock, CheckCircle2, Eraser } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Quiz {
  id: string;
  questionText: string;
  targetShape: string;
  timeLimit: number;
}

interface HistoryItem {
  question: string;
  correct: boolean;
  score: number;
}

interface EvalResult {
  score: number;
  feedback: string;
  isPassed: boolean;
}

interface Point {
  x: number;
  y: number;
}

export default function QuizWorkspace() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drawing state
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchNewQuiz();
  }, []);

  const fetchNewQuiz = () => {
    setLoading(true);
    setPoints([]);
    setEvalResult(null);
    fetch("http://localhost:8000/api/quiz/daily")
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.timeLimit || 60);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz, timeLeft]); // Re-attach if timeLeft > 0

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (submitting || timeLeft === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    // Clear previous drawing if starting new one, or just append. Let's clear for a new attempt.
    setPoints([{ x, y }]);
    setEvalResult(null);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setPoints([]);
    setEvalResult(null);
  };

  async function handleSubmit() {
    if (!quiz || submitting || points.length === 0) return;
    setSubmitting(true);
    setEvalResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          targetShape: quiz.targetShape,
          drawing: { points: points },
        }),
      });
      const data = await res.json();

      if (res.ok && data.evaluation) {
        setEvalResult(data.evaluation);
        setTotalScore((prev) => prev + data.evaluation.score);
        setHistory((prev) => [
          ...prev,
          {
            question: `Câu ${prev.length + 1}: ${quiz.targetShape}`,
            correct: data.evaluation.isPassed,
            score: data.evaluation.score,
          },
        ]);
        // Stop timer
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch {
      /* ignore */
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className={styles.workspace}>
        <div style={{ textAlign: "center", padding: "60px", color: "#5f6368" }}>
          Đang tải đề thi...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Session Status</h2>
            <div className={styles.statusRow}>
              <span className={styles.iconTrophy}>🏆</span>
              <span className={styles.statusText}>Score: {totalScore}</span>
            </div>
            <div className={styles.statusRow}>
              <Clock size={20} color="#5B7C99" strokeWidth={2} />
              <span
                className={styles.statusText}
                style={{ color: timeLeft <= 10 ? "#d93025" : "#5B7C99" }}
              >
                Time: {timeLeft}s
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.questionText}>
              <strong>Đề bài:</strong>{" "}
              {quiz?.questionText || "Đang tải..."}
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.historyTitle}>
              History of Completed Challenges
            </h3>
            <ul className={styles.historyList}>
              {history.map((item, idx) => (
                <li key={idx}>
                  <div className={styles.historyItem}>
                    <CheckCircle2
                      size={16}
                      color={item.correct ? "#188038" : "#d93025"}
                      strokeWidth={2.5}
                      className={styles.checkIcon}
                    />
                    <span>
                      {item.question} - {item.correct ? "Đúng" : "Sai"} (
                      {item.score} điểm)
                    </span>
                  </div>
                  {idx < history.length - 1 && (
                    <div className={styles.divider}></div>
                  )}
                </li>
              ))}
              {history.length === 0 && (
                <div style={{ fontSize: '13px', color: '#888' }}>Chưa có lịch sử.</div>
              )}
            </ul>
          </div>

          <div style={{ flex: 1 }}></div>

          {evalResult ? (
             <button
              className={styles.submitButton}
              onClick={fetchNewQuiz}
              style={{ background: '#34a853', borderColor: '#34a853' }}
             >
               Câu tiếp theo
             </button>
          ) : (
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={submitting || timeLeft === 0 || points.length === 0}
              style={{
                opacity: submitting || timeLeft === 0 || points.length === 0 ? 0.6 : 1,
              }}
            >
              {submitting
                ? "Đang chấm bài..."
                : timeLeft === 0
                ? "Hết giờ"
                : "Nộp bài"}
            </button>
          )}
        </aside>

        <main className={styles.canvasArea}>
          <div className={styles.canvasGrid}></div>
          <div className={styles.drawingContainer} style={{ position: 'relative', width: '100%', height: '100%' }}>
            
            <svg 
              className={styles.drawingSvg}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: 'none', cursor: 'crosshair', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            >
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              
              {points.length > 0 && (
                <path
                  d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#2a6ca6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            {/* Floating toolbar for clear canvas */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
              <button 
                onClick={clearCanvas}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'white', border: '1px solid #ddd',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
                  color: '#5f6368', fontWeight: 500, fontSize: '14px'
                }}
              >
                <Eraser size={16} /> Vẽ lại
              </button>
            </div>

            {evalResult ? (
              <div
                className={styles.feedbackBox}
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderColor: evalResult.isPassed ? "#b8d1ea" : "#f5c6cb",
                  backgroundColor: evalResult.isPassed ? "#e6f0fa" : "#f8d7da",
                  zIndex: 20
                }}
              >
                Matching Score: {evalResult.score}% -{" "}
                {evalResult.feedback}
              </div>
            ) : submitting ? (
              <div className={styles.feedbackBox} style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                ⏳ Đang chấm bài...
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
