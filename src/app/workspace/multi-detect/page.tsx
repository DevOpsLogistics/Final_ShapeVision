"use client";

import styles from "./multi.module.css";
import { User, Settings, Edit2, Trash2, PlusSquare, Hand, Triangle, Square, Circle, ChevronDown, RefreshCw, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

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

interface ImageItem {
  id: string;
  dataUrl: string;
  detections: Detection[];
  loading: boolean;
  imageSize: { width: number, height: number } | null;
}

export default function MultiDetectWorkspace() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const [activeTool, setActiveTool] = useState<string>('edit');
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  
  // Interactive States
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [tempBox, setTempBox] = useState<{xMin: number, yMin: number, xMax: number, yMax: number} | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] || null;

  const fetchDetections = async (imageId: string, base64Data: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, loading: true, detections: [] } : img));
    try {
      const res = await fetch("http://localhost:8000/api/detect-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data })
      });
      const data = await res.json();
      if (data.detections) {
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, detections: data.detections, loading: false } : img));
      } else {
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, loading: false } : img));
      }
    } catch (err) {
      console.error(err);
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, loading: false } : img));
    }
  };

  const handleRefresh = () => {
    if (activeImage) {
      fetchDetections(activeImage.id, activeImage.dataUrl);
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
          detections: [],
          loading: true,
          imageSize: null
        });

        count++;
        // If all files are read
        if (count === files.length) {
          setImages(prev => {
            const updated = [...prev, ...newImages];
            // If it's the first upload, set active to the first new one
            if (prev.length === 0) {
              setActiveIndex(0);
            }
            return updated;
          });

          // Fetch detections for all new images
          newImages.forEach(img => {
            fetchDetections(img.id, img.dataUrl);
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (activeImage) {
      setImages(prev => prev.map(item => 
        item.id === activeImage.id 
          ? { ...item, imageSize: { width: img.naturalWidth, height: img.naturalHeight } } 
          : item
      ));
    }
  };

  const getMouseCoords = (e: React.MouseEvent | React.TouchEvent | any) => {
    if (!containerRef.current || !activeImage?.imageSize) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = activeImage.imageSize.width / rect.width;
    const scaleY = activeImage.imageSize.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleContainerMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'add') {
      const { x, y } = getMouseCoords(e);
      setIsDragging(true);
      setDragType('draw');
      setStartPos({ x, y });
      setTempBox({ xMin: x, yMin: y, xMax: x, yMax: y });
    } else if (activeTool !== 'pan') {
      setSelectedBoxId(null);
    }
  };

  const updateActiveImageDetections = (updater: (prev: Detection[]) => Detection[]) => {
    if (!activeImage) return;
    setImages(prev => prev.map(img => 
      img.id === activeImage.id 
        ? { ...img, detections: updater(img.detections) } 
        : img
    ));
  };

  const handleContainerMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !startPos || !activeImage) return;
    const { x, y } = getMouseCoords(e);
    
    if (dragType === 'draw' && tempBox) {
       setTempBox({
          xMin: Math.min(startPos.x, x),
          xMax: Math.max(startPos.x, x),
          yMin: Math.min(startPos.y, y),
          yMax: Math.max(startPos.y, y),
       });
    } else if (dragType === 'move' && selectedBoxId) {
       const dx = x - startPos.x;
       const dy = y - startPos.y;
       updateActiveImageDetections(prev => prev.map(d => {
         if (d.id === selectedBoxId) {
            return {
              ...d,
              boundingBox: {
                xMin: d.boundingBox.xMin + dx,
                xMax: d.boundingBox.xMax + dx,
                yMin: d.boundingBox.yMin + dy,
                yMax: d.boundingBox.yMax + dy,
              }
            }
         }
         return d;
       }));
       setStartPos({ x, y });
    } else if (dragType && dragType.startsWith('resize') && selectedBoxId) {
       updateActiveImageDetections(prev => prev.map(d => {
         if (d.id === selectedBoxId) {
            const newBox = { ...d.boundingBox };
            if (dragType === 'resize-tl') {
               newBox.xMin = Math.min(x, newBox.xMax - 10);
               newBox.yMin = Math.min(y, newBox.yMax - 10);
            } else if (dragType === 'resize-br') {
               newBox.xMax = Math.max(x, newBox.xMin + 10);
               newBox.yMax = Math.max(y, newBox.yMin + 10);
            } else if (dragType === 'resize-tr') {
               newBox.xMax = Math.max(x, newBox.xMin + 10);
               newBox.yMin = Math.min(y, newBox.yMax - 10);
            } else if (dragType === 'resize-bl') {
               newBox.xMin = Math.min(x, newBox.xMax - 10);
               newBox.yMax = Math.max(y, newBox.yMin + 10);
            }
            return { ...d, boundingBox: newBox };
         }
         return d;
       }));
    }
  };

  const handleContainerMouseUp = () => {
    if (isDragging && dragType === 'draw' && tempBox) {
       const newId = `custom_${Date.now()}`;
       // Only add if it has some area
       if (Math.abs(tempBox.xMax - tempBox.xMin) > 10 && Math.abs(tempBox.yMax - tempBox.yMin) > 10) {
         updateActiveImageDetections(prev => [...prev, {
            id: newId,
            label: "Tự định nghĩa",
            confidence: 1.0,
            color: "#F59E0B",
            boundingBox: tempBox
         }]);
         setSelectedBoxId(newId);
       }
    }
    setIsDragging(false);
    setDragType(null);
    setStartPos(null);
    setTempBox(null);
  };

  const handleBoxClick = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      updateActiveImageDetections(prev => prev.filter(d => d.id !== id));
      if (selectedBoxId === id) setSelectedBoxId(null);
    } else if (activeTool === 'edit') {
      setSelectedBoxId(id);
    }
  };

  const handleBoxMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (activeTool === 'edit') {
       e.stopPropagation();
       setSelectedBoxId(id);
       setIsDragging(true);
       setDragType('move');
       setStartPos(getMouseCoords(e));
    }
  };

  const handleHandleMouseDown = (e: React.MouseEvent | React.TouchEvent, type: string) => {
     e.stopPropagation();
     setIsDragging(true);
     setDragType(type);
     setStartPos(getMouseCoords(e));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeIndex === indexToRemove) {
      setActiveIndex(Math.max(0, indexToRemove - 1));
    } else if (activeIndex > indexToRemove) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const renderBox = (box: any, color: string, isSelected: boolean, id: string, label: string, conf: number) => {
    if (!activeImage?.imageSize) return null;
    
    // Scale coords to percentages
    const left = (box.xMin / activeImage.imageSize.width) * 100;
    const top = (box.yMin / activeImage.imageSize.height) * 100;
    const width = ((box.xMax - box.xMin) / activeImage.imageSize.width) * 100;
    const height = ((box.yMax - box.yMin) / activeImage.imageSize.height) * 100;

    const handleStyle = {
      position: 'absolute' as const,
      width: '12px', height: '12px',
      backgroundColor: '#fff',
      border: `2px solid ${color}`,
      borderRadius: '50%',
      zIndex: 20
    };

    return (
      <div 
        key={id}
        style={{
           position: 'absolute',
           left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
           border: `2px solid ${color}`,
           pointerEvents: (activeTool === 'edit' || activeTool === 'delete') ? 'auto' : 'none',
           cursor: activeTool === 'delete' ? 'pointer' : (activeTool === 'edit' ? 'move' : 'default'),
           backgroundColor: isSelected ? 'rgba(26, 115, 232, 0.15)' : 'transparent',
           zIndex: isSelected ? 10 : 1
        }}
        onMouseDown={(e) => handleBoxMouseDown(e, id)}
        onClick={(e) => handleBoxClick(e, id)}
        onTouchStart={(e) => handleBoxMouseDown(e, id)}
      >
        <div style={{
          position: 'absolute',
          top: '-24px', left: '-2px',
          backgroundColor: color, color: '#fff',
          padding: '2px 8px', fontSize: '12px', fontWeight: 'bold',
          borderTopLeftRadius: '4px', borderTopRightRadius: '4px',
          whiteSpace: 'nowrap'
        }}>
          {label} - {Math.round(conf * 100)}%
        </div>

        {isSelected && activeTool === 'edit' && (
          <>
            <div style={{...handleStyle, top: '-6px', left: '-6px', cursor: 'nwse-resize'}} onMouseDown={(e) => handleHandleMouseDown(e, 'resize-tl')} onTouchStart={(e) => handleHandleMouseDown(e, 'resize-tl')} />
            <div style={{...handleStyle, top: '-6px', right: '-6px', cursor: 'nesw-resize'}} onMouseDown={(e) => handleHandleMouseDown(e, 'resize-tr')} onTouchStart={(e) => handleHandleMouseDown(e, 'resize-tr')} />
            <div style={{...handleStyle, bottom: '-6px', left: '-6px', cursor: 'nesw-resize'}} onMouseDown={(e) => handleHandleMouseDown(e, 'resize-bl')} onTouchStart={(e) => handleHandleMouseDown(e, 'resize-bl')} />
            <div style={{...handleStyle, bottom: '-6px', right: '-6px', cursor: 'nwse-resize'}} onMouseDown={(e) => handleHandleMouseDown(e, 'resize-br')} onTouchStart={(e) => handleHandleMouseDown(e, 'resize-br')} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Tải ảnh lên</h2>
          <input 
            type="file" 
            accept="image/*" 
            id="multi-upload"
            multiple
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <label htmlFor="multi-upload" style={{
            display: 'block', padding: '12px', background: '#1A73E8', color: 'white', 
            textAlign: 'center', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px'
          }}>
            Chọn File Ảnh
          </label>
          <div style={{ fontSize: '12px', color: '#5f6368', marginBottom: '24px', textAlign: 'center' }}>
            Đã tải lên {images.length} file
          </div>

          <h2 className={styles.sidebarTitle}>Kết Quả Nhận Diện</h2>

          {activeImage?.loading ? (
            <div style={{ padding: '16px', color: '#5f6368' }}>Đang phân tích...</div>
          ) : activeImage ? (
            <div className={styles.accordionGroup}>
              <div className={styles.accordionHeader}>
                <ChevronDown size={14} strokeWidth={2} />
                <span>Số đối tượng: {activeImage.detections.length}</span>
              </div>
              <div className={styles.accordionContent}>
                {activeImage.detections.map((d, index) => (
                  <div key={d.id} className={styles.shapeItem} style={{ backgroundColor: selectedBoxId === d.id ? '#e8f0fe' : 'transparent', cursor: 'pointer' }} onClick={() => { setActiveTool('edit'); setSelectedBoxId(d.id); }}>
                    <Square size={16} color={d.color} fill="#D3DDE6" strokeWidth={1} />
                    <span>#{index + 1}: {d.label} ({Math.round(d.confidence * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px', color: '#5f6368', fontSize: '14px' }}>Chưa có ảnh nào được chọn.</div>
          )}
        </aside>

        {/* Main Canvas Area */}
        <main className={styles.canvasArea} style={{ cursor: activeTool === 'add' ? 'crosshair' : (activeTool === 'pan' ? 'grab' : 'default'), display: 'flex', flexDirection: 'column' }}>
          <div className={styles.canvasGrid} style={{ flex: 1, zIndex: 0 }}></div>
          
          {/* Floating Toolbar */}
          <div className={styles.floatingToolbar} style={{ zIndex: 100 }}>
            <div className={styles.toolItem} onClick={handleRefresh}>
              <button className={styles.toolBtn}><RefreshCw size={16} strokeWidth={2} className={activeImage?.loading ? styles.spin : ""} /></button>
              <div className={styles.tooltip}>Phân tích lại</div>
            </div>
            <div className={styles.toolItem} onClick={() => setActiveTool('edit')}>
              <button className={activeTool === 'edit' ? styles.toolBtnActive : styles.toolBtn}><Edit2 size={16} strokeWidth={2} /></button>
              <div className={styles.tooltip}>Chỉnh sửa</div>
            </div>
            <div className={styles.toolItem} onClick={() => setActiveTool('delete')}>
              <button className={activeTool === 'delete' ? styles.toolBtnActive : styles.toolBtn}><Trash2 size={16} strokeWidth={2} /></button>
              <div className={styles.tooltip}>Xóa</div>
            </div>
            <div className={styles.toolItem} onClick={() => setActiveTool('add')}>
              <button className={activeTool === 'add' ? styles.toolBtnActive : styles.toolBtn}><PlusSquare size={16} strokeWidth={2} /></button>
              <div className={styles.tooltip}>Thêm điểm</div>
            </div>
            <div className={styles.toolItem} onClick={() => setActiveTool('pan')}>
              <button className={activeTool === 'pan' ? styles.toolBtnActive : styles.toolBtn}><Hand size={16} strokeWidth={2} /></button>
              <div className={styles.tooltip}>Kéo thả</div>
            </div>
          </div>
          
          {/* Canvas Graphics */}
          <div className={styles.canvasContent} style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
            {activeImage?.loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                ⏳ Đang xử lý ảnh...
              </div>
            ) : activeImage ? (
              <div 
                ref={containerRef}
                style={{ position: 'relative', display: 'inline-block', touchAction: 'none' }}
                onMouseDown={handleContainerMouseDown}
                onMouseMove={handleContainerMouseMove}
                onMouseUp={handleContainerMouseUp}
                onMouseLeave={handleContainerMouseUp}
                onTouchStart={handleContainerMouseDown}
                onTouchMove={handleContainerMouseMove}
                onTouchEnd={handleContainerMouseUp}
              >
                <img 
                  src={activeImage.dataUrl} 
                  alt="Uploaded for detection" 
                  onLoad={handleImageLoad}
                  style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)', display: 'block', pointerEvents: 'none' }} 
                  draggable={false}
                />
                
                {/* Bounding Boxes */}
                {activeImage.detections.map(d => renderBox(d.boundingBox, d.color, selectedBoxId === d.id, d.id, d.label, d.confidence))}

                {/* Temp Draw Box */}
                {isDragging && dragType === 'draw' && tempBox && renderBox(tempBox, "#F59E0B", false, "temp_draw", "Đang vẽ...", 1.0)}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5f6368' }}>
                Vui lòng tải ảnh lên để nhận diện
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
                  onClick={() => { setActiveIndex(idx); setSelectedBoxId(null); }}
                >
                  <img src={img.dataUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
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
