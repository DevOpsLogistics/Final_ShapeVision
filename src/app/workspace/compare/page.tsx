"use client";

import styles from "./compare.module.css";
import { useEffect, useState } from "react";

interface Metric {
  id: string;
  name: string;
  accuracy: number;
  inferenceTime: number;
  size: number;
  params: number;
  color: string;
}

interface Trend {
  epoch: number;
  [key: string]: any;
}

interface ConfusionMatrix {
  labels: string[];
  matrix: number[][];
}

interface CompareData {
  metrics: Metric[];
  trends: Trend[];
  confusionMatrix: ConfusionMatrix;
}

export default function CompareWorkspace() {
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vision/compare")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.workspace} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>⏳ Đang tải dữ liệu mô hình...</div>;
  }

  if (!data) return <div className={styles.workspace}>Lỗi tải dữ liệu.</div>;

  const getColorForMatrix = (val: number) => {
    if (val >= 90) return { bg: '#1a569d', text: '#fff' };
    if (val >= 50) return { bg: '#2e71b5', text: '#fff' };
    if (val >= 10) return { bg: '#b8d1ea', text: '#000' };
    if (val > 0) return { bg: '#e6eefa', text: '#000' };
    return { bg: '#ffffff', text: '#000' };
  };

  return (
    <div className={styles.workspace}>
      {/* Header Section */}
      

      {/* Main Grid Layout */}
      <div className={styles.mainGrid}>
        
        {/* Top Left: Performance Metrics Table */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Performance Metrics Summary</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Inference Time</th>
                  <th>Model Size</th>
                  <th>Parameters</th>
                </tr>
              </thead>
              <tbody>
                {data.metrics.map(m => (
                  <tr key={m.id}>
                    <td style={{ color: m.color, fontWeight: 'bold' }}>{m.name}</td>
                    <td className={m.accuracy > 95 ? styles.highlightText : ''}>{m.accuracy}%</td>
                    <td>{m.inferenceTime}ms</td>
                    <td className={m.size > 40 ? styles.highlightText : ''}>{m.size}MB</td>
                    <td>{m.params}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Right: Training Trends (Line Charts) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Training Trends</h2>
          <div className={styles.chartsRow}>
            {/* Accuracy vs Epoch Chart */}
            <div className={styles.chartWrapper}>
              <h3 className={styles.chartTitle}>Accuracy vs Epoch</h3>
              <div className={styles.chartSvgContainer}>
                {/* Y-Axis Labels */}
                <div className={styles.yAxisLabels}>
                  <span>100%</span>
                  <span>80%</span>
                  <span>60%</span>
                  <span>40%</span>
                  <span>20%</span>
                  <span>0%</span>
                </div>
                {/* SVG Chart */}
                <div className={styles.svgArea}>
                  <svg viewBox="0 0 200 100" preserveAspectRatio="none" className={styles.lineSvg}>
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#727785" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#727785" strokeWidth="0.5" />
                    {/* Hardcoded paths for visual fidelity, but legend is dynamic */}
                    <path d="M0,80 Q20,20 100,10 T200,8" fill="none" stroke="#1A73E8" strokeWidth="1.5" />
                    <path d="M0,80 Q20,30 100,15 T200,12" fill="none" stroke="#C5221F" strokeWidth="1.5" />
                    <path d="M0,80 Q15,10 100,5 T200,3" fill="none" stroke="#188038" strokeWidth="1.5" />
                  </svg>
                  <div className={styles.chartLegend}>
                    {data.metrics.map(m => (
                      <div key={m.id} className={styles.legendRow}>
                        <span style={{backgroundColor: m.color}}></span> {m.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* X-Axis Labels */}
              <div className={styles.xAxisLabels}>
                <span>Epoch 1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>Epoch</span>
              </div>
            </div>

            {/* Loss vs Epoch Chart */}
            <div className={styles.chartWrapper}>
              <h3 className={styles.chartTitle}>Loss vs Epoch</h3>
              <div className={styles.chartSvgContainer}>
                {/* Y-Axis Labels */}
                <div className={styles.yAxisLabels}>
                  <span>1.0</span>
                  <span>0.8</span>
                  <span>0.6</span>
                  <span>0.4</span>
                  <span>0.2</span>
                  <span>0</span>
                </div>
                {/* SVG Chart */}
                <div className={styles.svgArea}>
                  <svg viewBox="0 0 200 100" preserveAspectRatio="none" className={styles.lineSvg}>
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#727785" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#727785" strokeWidth="0.5" />
                    <path d="M0,0 Q20,80 100,90 T200,92" fill="none" stroke="#1A73E8" strokeWidth="1.5" />
                    <path d="M0,0 Q20,60 100,85 T200,88" fill="none" stroke="#C5221F" strokeWidth="1.5" />
                    <path d="M0,0 Q15,90 100,95 T200,97" fill="none" stroke="#188038" strokeWidth="1.5" />
                  </svg>
                  <div className={styles.chartLegendTopRight}>
                    {data.metrics.map(m => (
                      <div key={m.id} className={styles.legendRow}>
                        <span style={{backgroundColor: m.color}}></span> {m.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.xAxisLabels}>
                <span>Epoch 1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>Epoch</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Left: Confusion Matrix */}
        <section className={styles.section} style={{ gridRow: '2', gridColumn: '1' }}>
          <h2 className={styles.sectionTitle}>Confusion Matrix - Shape Classification (ResNet)</h2>
          <div className={styles.confusionMatrixWrapper}>
            <div className={styles.matrixYLabels}>
              {data.confusionMatrix.labels.map(l => <span key={l}>{l}</span>)}
            </div>
            <div className={styles.matrixMain}>
              {/* Dynamic Grid */}
              <div className={styles.matrixGrid}>
                {data.confusionMatrix.matrix.map((row, i) => 
                  row.map((val, j) => {
                    const colors = getColorForMatrix(val);
                    return (
                      <div key={`${i}-${j}`} className={styles.cell} style={{ backgroundColor: colors.bg, color: colors.text }}>
                        {val}
                      </div>
                    );
                  })
                )}
              </div>
              <div className={styles.matrixXLabels}>
                {data.confusionMatrix.labels.map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
            
            {/* Color Legend */}
            <div className={styles.matrixLegend}>
              <span>High (100)</span>
              <div className={styles.gradientBar}></div>
              <span>Low (0)</span>
            </div>
          </div>
        </section>
        
        <section className={styles.emptySection} style={{ gridRow: '2', gridColumn: '2' }}>
        </section>

      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        ShapeVision AI Workspace © 2024. Scientific Data Analysis.
      </footer>
    </div>
  );
}
