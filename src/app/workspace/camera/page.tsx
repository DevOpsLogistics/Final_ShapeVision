"use client";

import styles from "./camera.module.css";
import { Camera, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  color: string;
}

export default function WorkspaceCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // AI Interactive Box States
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [aiResult, setAiResult] = useState<any[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Lỗi khi mở camera:", err);
      alert("Không thể truy cập camera. Vui lòng cấp quyền!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
      setDetections([]);
      setCurrentBox(null);
      setAiResult(null);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(async () => {
        // Skip background contour detection if user is currently drawing an AI box
        if (isDrawing) return;

        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          if (video.videoWidth === 0) return;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg');
            
            try {
              const res = await fetch("http://localhost:8000/api/detect-multi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64 })
              });
              const data = await res.json();
              if (data.detections) {
                setDetections(data.detections);
                
                if (data.detections.length > 0) {
                  const newLog = `${new Date().toLocaleTimeString()} - Phát hiện: ${data.detections.map((d: any) => d.label).join(", ")}`;
                  setLogs(prev => [newLog, ...prev].slice(0, 10)); // keep last 10
                }
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }, 1000); // scan every 1 second
    }
    
    return () => clearInterval(interval);
  }, [isActive, isDrawing]);

  // Handle Box Drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !isActive) return;
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
    setIsDrawing(true);
    setAiResult(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    setCurrentBox({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      w: Math.abs(currentX - startPos.x),
      h: Math.abs(currentY - startPos.y)
    });
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentBox && currentBox.w > 10 && currentBox.h > 10 && videoRef.current) {
      // Create offscreen canvas for cropping
      const canvas = document.createElement("canvas");
      // Scale visual coordinate to actual video dimension
      const scaleX = videoRef.current.videoWidth / videoRef.current.offsetWidth;
      const scaleY = videoRef.current.videoHeight / videoRef.current.offsetHeight;
      
      canvas.width = currentBox.w * scaleX;
      canvas.height = currentBox.h * scaleY;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(
          videoRef.current,
          currentBox.x * scaleX, currentBox.y * scaleY, canvas.width, canvas.height,
          0, 0, canvas.width, canvas.height
        );
        const base64 = canvas.toDataURL("image/jpeg");
        
        // Call AI API
        setIsAiLoading(true);
        try {
          const res = await fetch("http://localhost:8000/api/recognize-region", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 })
          });
          const data = await res.json();
          if (data.predictions) {
            setAiResult(data.predictions);
          } else if (data.error) {
            setAiResult([{ label: "Lỗi: " + data.error, score: 0 }]);
          }
        } catch (err) {
          console.error(err);
          setAiResult([{ label: "Lỗi kết nối AI", score: 0 }]);
        }
        setIsAiLoading(false);
      }
    } else {
      setCurrentBox(null);
    }
  };

  if (!mounted) {
    return <div className={styles.workspace}>Đang tải...</div>;
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Khu Vực Làm Việc Camera</h2>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.primaryButton} onClick={startCamera} disabled={isActive}>Bắt đầu</button>
            <button className={styles.secondaryButton} onClick={stopCamera} disabled={!isActive}>Dừng</button>
          </div>
          
          {isActive && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: 'bold', marginBottom: '8px' }}>
                <ScanLine size={18} />
                AI Nhận Diện Thủ Công
              </div>
              <p style={{ fontSize: '13px', color: '#4338ca', margin: 0, lineHeight: 1.4 }}>
                Dùng chuột kéo thả trực tiếp lên khung hình camera để khoanh vùng khu vực bạn muốn AI nhận diện chuyên sâu.
              </p>
            </div>
          )}

          {/* AI Results */}
          {currentBox && (isAiLoading || aiResult) && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', border: '2px solid #1A73E8', backgroundColor: '#fff' }}>
              <div style={{ fontWeight: 'bold', color: '#1A73E8', marginBottom: '8px' }}>Nhận diện Hình Khối</div>
              <div>
                {isAiLoading ? (
                  <div style={{color: '#1A73E8', fontSize: '14px'}}>⏳ Đang phân tích vùng chọn...</div>
                ) : (
                  <div>
                    {aiResult && aiResult.map((res: any, idx: number) => (
                      <div key={idx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px', fontSize: '14px'}}>
                        <span style={{fontWeight: idx === 0 ? 'bold' : 'normal', textTransform: 'capitalize', color: '#333'}}>{res.label}</span>
                        <span style={{color: '#1A73E8', fontWeight: idx === 0 ? 'bold' : 'normal'}}>{(res.score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detection Log */}
          <div className={styles.logGroup} style={{ marginTop: '24px' }}>
            <label className={styles.labelTitle}>Nhật ký Phát hiện Tự động</label>
            <div className={styles.logBox}>
              {logs.length > 0 ? (
                logs.map((log, index) => <div key={index} style={{marginBottom: '4px'}}>{log}</div>)
              ) : (
                <div style={{color: '#999', fontStyle: 'italic'}}>Chưa có dữ liệu...</div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className={styles.canvasArea} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
          <div className={styles.canvasGrid}></div>
          
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '800px', 
              display: 'flex', 
              justifyContent: 'center',
              cursor: isActive ? 'crosshair' : 'default',
              userSelect: 'none'
            }} 
            suppressHydrationWarning
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              draggable={false}
              suppressHydrationWarning
              style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '2px solid #333', display: isActive ? 'block' : 'none', pointerEvents: 'none' }} 
            />
            
            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!isActive && (
              <div style={{width: '100%', height: '400px', backgroundColor: '#1e1e1e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', border: '2px dashed #444'}}>
                <div style={{textAlign: 'center'}}>
                  <Camera size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                  <div>Camera đang tắt. Bấm "Bắt đầu" để mở.</div>
                </div>
              </div>
            )}

            {/* AI Custom Bounding Box */}
            {currentBox && (
              <div 
                style={{
                  position: 'absolute',
                  left: currentBox.x,
                  top: currentBox.y,
                  width: currentBox.w,
                  height: currentBox.h,
                  border: '2px dashed #1A73E8',
                  backgroundColor: 'rgba(26, 115, 232, 0.2)',
                  pointerEvents: 'none',
                  zIndex: 20
                }}
              />
            )}

            {/* Auto Detection Bounding Boxes */}
            {isActive && videoRef.current && detections.map(d => {
              const scaleX = videoRef.current!.offsetWidth / videoRef.current!.videoWidth;
              const scaleY = videoRef.current!.offsetHeight / videoRef.current!.videoHeight;
              
              const x = d.boundingBox.xMin * scaleX;
              const y = d.boundingBox.yMin * scaleY;
              const w = (d.boundingBox.xMax - d.boundingBox.xMin) * scaleX;
              const h = (d.boundingBox.yMax - d.boundingBox.yMin) * scaleY;
              
              return (
                <div 
                  key={d.id}
                  style={{
                    position: 'absolute',
                    border: `2px solid ${d.color}`,
                    left: `${x}px`, 
                    top: `${y}px`, 
                    width: `${w}px`, 
                    height: `${h}px`,
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '-2px',
                    backgroundColor: d.color,
                    color: '#fff',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {d.label} - {Math.round(d.confidence * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
