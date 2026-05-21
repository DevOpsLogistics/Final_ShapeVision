"use client";

import styles from "./analysis.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Layers, Image as ImageIcon } from "lucide-react";

interface Metrics {
  precision: number;
  recall: number;
  f1Score: number;
  iou: number;
}

interface Layer {
  id: number;
  name: string;
  filters?: number;
  poolSize?: string;
  stride?: number;
  units?: number;
  activation?: string;
  size: string;
}

interface AnalysisData {
  metrics: Metrics;
  layers: Layer[];
  featuresMap: string[];
}

export default function AnalysisWorkspace() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vision/analysis")
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

  if (loading || !data) {
    return <div className={styles.loading}>⏳ Phân tích kiến trúc mạng nơ-ron...</div>;
  }

  return (
    <div className={styles.workspace}>
      

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Activity size={18} /> Performance Metrics</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Precision</span>
                <span className={styles.metricValue}>{data.metrics.precision}%</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Recall</span>
                <span className={styles.metricValue}>{data.metrics.recall}%</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>F1-Score</span>
                <span className={styles.metricValue}>{data.metrics.f1Score}%</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>IoU</span>
                <span className={styles.metricValue}>{data.metrics.iou}%</span>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ flex: 1 }}>
            <h2 className={styles.cardTitle}><ImageIcon size={18} /> Feature Maps</h2>
            <div className={styles.featuresGrid}>
              {data.featuresMap.map((_, i) => (
                <div key={i} className={styles.featureBox}>
                  {/* Mock rendering image using SVG pattern to simulate a CNN filter activation */}
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect width="100" height="100" fill="#161A22" />
                    <circle cx={50} cy={50} r={20 + i*10} fill="none" stroke="#1A73E8" strokeWidth="2" opacity={0.5} strokeDasharray="4 2" />
                    <rect x={20 - i*5} y={20 - i*5} width={60 + i*10} height={60 + i*10} fill="none" stroke="#669DF6" strokeWidth="1" opacity={0.3} />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card} style={{ flex: 1 }}>
            <h2 className={styles.cardTitle}><Layers size={18} /> Network Architecture Layers</h2>
            <div className={styles.layersList}>
              {data.layers.map(layer => (
                <div key={layer.id} className={styles.layerItem}>
                  <div className={styles.layerLeft}>
                    <div className={styles.layerId}>{layer.id}</div>
                    <div className={styles.layerName}>{layer.name}</div>
                  </div>
                  <div className={styles.layerDetails}>
                    <span>{layer.size}</span>
                    {layer.activation && <span className={styles.detailTag}>{layer.activation}</span>}
                    {layer.filters && <span>Filters: {layer.filters}</span>}
                    {layer.units && <span>Units: {layer.units}</span>}
                    {layer.poolSize && <span>Pool: {layer.poolSize}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
