"use client";

import styles from "./upload.module.css";
import { UploadCloud, ScanLine, X, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";

interface ImageItem {
  id: string;
  dataUrl: string;
  processedData: string | null;
  stats: any | null;
  loading: boolean;
  fileMeta: { name: string, size: number };
  
  aiResult: any[] | null;
  isAiLoading: boolean;
  currentBox: { x: number, y: number, w: number, h: number } | null;
}

export default function WorkspaceUpload() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeImage = images[activeIndex] || null;

  const updateActiveImage = (updater: (img: ImageItem) => ImageItem) => {
    if (!activeImage) return;
    setImages(prev => prev.map(img => img.id === activeImage.id ? updater(img) : img));
  };

  const processContour = async (imageId: string, base64Data: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, loading: true } : img));
    try {
      const res = await fetch("http://localhost:8000/api/analyze-contour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data })
      });
      const data = await res.json();
      if (data.processedImage) {
        setImages(prev => prev.map(img => img.id === imageId ? { 
          ...img, 
          loading: false, 
          processedData: data.processedImage, 
          stats: data.stats 
        } : img));
      } else {
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, loading: false } : img));
      }
    } catch (err) {
      console.error("Detection error:", err);
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, loading: false } : img));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageItem[] = [];
    let count = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const newId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        newImages.push({
          id: newId,
          dataUrl: base64,
          processedData: null,
          stats: null,
          loading: true,
          fileMeta: { name: file.name, size: file.size },
          aiResult: null,
          isAiLoading: false,
          currentBox: null
        });

        count++;
        if (count === files.length) {
          setImages(prev => {
            const updated = [...prev, ...newImages];
            if (prev.length === 0) {
              setActiveIndex(0);
            }
            return updated;
          });

          newImages.forEach(img => {
            processContour(img.id, img.dataUrl);
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || activeImage?.loading) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    
    updateActiveImage(img => ({
      ...img,
      currentBox: { x, y, w: 0, h: 0 },
      aiResult: null
    }));
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !imageRef.current || !activeImage) return;
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    updateActiveImage(img => ({
      ...img,
      currentBox: {
        x: Math.min(startPos.x, currentX),
        y: Math.min(startPos.y, currentY),
        w: Math.abs(currentX - startPos.x),
        h: Math.abs(currentY - startPos.y)
      }
    }));
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (activeImage?.currentBox && activeImage.currentBox.w > 10 && activeImage.currentBox.h > 10 && imageRef.current) {
      const currentBox = activeImage.currentBox;
      const canvas = document.createElement("canvas");
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      
      canvas.width = currentBox.w * scaleX;
      canvas.height = currentBox.h * scaleY;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(
          imageRef.current,
          currentBox.x * scaleX, currentBox.y * scaleY, canvas.width, canvas.height,
          0, 0, canvas.width, canvas.height
        );
        const base64 = canvas.toDataURL("image/jpeg");
        
        updateActiveImage(img => ({ ...img, isAiLoading: true }));
        try {
          const res = await fetch("http://localhost:8000/api/recognize-region", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 })
          });
          const data = await res.json();
          if (data.predictions) {
            updateActiveImage(img => ({ ...img, aiResult: data.predictions }));
          } else if (data.error) {
            updateActiveImage(img => ({ ...img, aiResult: [{ label: "Lỗi: " + data.error, score: 0 }] }));
          }
        } catch (err) {
          console.error(err);
          updateActiveImage(img => ({ ...img, aiResult: [{ label: "Lỗi kết nối máy chủ", score: 0 }] }));
        }
        updateActiveImage(img => ({ ...img, isAiLoading: false }));
      }
    } else {
      updateActiveImage(img => ({ ...img, currentBox: null }));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeIndex === indexToRemove) {
      setActiveIndex(Math.max(0, indexToRemove - 1));
    } else if (activeIndex > indexToRemove) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          {/* Dropzone */}
          <input 
            type="file" 
            accept="image/*" 
            multiple
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div 
            className={styles.dropzone} 
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', backgroundColor: images.length > 0 ? '#f0f4f8' : 'white' }}
          >
            <UploadCloud size={32} color="#1A73E8" strokeWidth={1.5} />
            <p className={styles.dropzoneText}>
              {images.length > 0 ? `Đã tải lên ${images.length} file` : 'Kéo thả ảnh hoặc '} 
              {images.length === 0 && <span className={styles.linkText}>Chọn file</span>}
            </p>
          </div>

          {/* AI Guide Card */}
          {images.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle} style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#1A73E8'}}>
                <ScanLine size={18} />
                Tính năng Khoanh vùng AI
              </div>
              <div className={styles.cardBody}>
                <p style={{fontSize: '13px', color: '#555', lineHeight: '1.5'}}>
                  Kéo thả chuột trên bức ảnh để tạo vùng chữ nhật. AI sẽ phân tích và dự đoán xem có đồ vật gì bên trong vùng đó.
                </p>
              </div>
            </div>
          )}

          {/* AI Results */}
          {activeImage?.currentBox && (activeImage.isAiLoading || activeImage.aiResult) && (
            <div className={styles.card} style={{borderColor: '#1A73E8', borderWidth: '2px'}}>
              <div className={styles.cardTitle} style={{backgroundColor: '#E8F0FE', color: '#1A73E8'}}>Dự đoán AI (MobileNetV2)</div>
              <div className={styles.cardBody}>
                {activeImage.isAiLoading ? (
                  <div style={{color: '#1A73E8', fontWeight: 'bold'}}>⏳ Đang gọi siêu máy tính phân tích...</div>
                ) : (
                  <div>
                    {activeImage.aiResult && activeImage.aiResult.map((res: any, idx: number) => (
                      <div key={idx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px'}}>
                        <span style={{fontWeight: idx === 0 ? 'bold' : 'normal', textTransform: 'capitalize'}}>{res.label}</span>
                        <span style={{color: '#1A73E8', fontWeight: idx === 0 ? 'bold' : 'normal'}}>{(res.score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Card */}
          {activeImage?.stats && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Phân Tích Viền Cơ Bản</div>
              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  Số viền (contours): <span style={{fontWeight: 'bold', color: '#1A73E8'}}>{activeImage.stats.count}</span>
                </div>
                <div className={styles.metaRow}>
                  Trạng thái: <span>{activeImage.stats.message}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Canvas Area */}
        <main className={styles.canvasArea} style={{display: 'flex', flexDirection: 'column', backgroundColor: '#e0e0e0', position: 'relative'}}>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            {images.length > 0 ? (
              <div className={styles.imageWrapper} style={{ position: 'relative', display: 'inline-block', zIndex: 1, userSelect: 'none' }}>
                <div 
                  style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img 
                    ref={imageRef}
                    src={activeImage?.processedData || activeImage?.dataUrl} 
                    alt="Uploaded" 
                    style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)', display: 'block', pointerEvents: 'none' }} 
                    draggable={false}
                  />
                  
                  {activeImage?.currentBox && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: activeImage.currentBox.x,
                        top: activeImage.currentBox.y,
                        width: activeImage.currentBox.w,
                        height: activeImage.currentBox.h,
                        border: '2px solid red',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                  
                  {activeImage?.loading && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <span style={{ color: '#1A73E8', fontWeight: 'bold' }}>⏳ Đang vẽ viền...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5f6368', zIndex: 1}}>
                Chưa có ảnh nào được tải lên
              </div>
            )}
          </div>

          {/* Thumbnails Carousel */}
          {images.length > 0 && (
            <div style={{ 
              height: '100px', 
              background: '#1A1C23', 
              borderTop: '1px solid #333642',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '12px',
              overflowX: 'auto',
              zIndex: 20
            }}>
              {images.map((img, idx) => (
                <div 
                  key={img.id} 
                  style={{ 
                    position: 'relative', 
                    width: '64px', 
                    height: '64px', 
                    flexShrink: 0,
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: activeIndex === idx ? '2px solid #1A73E8' : '2px solid transparent',
                    cursor: 'pointer',
                    opacity: activeIndex === idx ? 1 : 0.6
                  }}
                  onClick={() => setActiveIndex(idx)}
                >
                  <img src={img.processedData || img.dataUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {img.loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={16} color="white" className={styles.spin} />
                    </div>
                  )}

                  <div 
                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                  >
                    <X size={12} color="white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
