"use client";

import styles from "./draw.module.css";
import { MousePointer2, Move, PenTool, Circle, Square, Triangle, Type, Download, Settings, Layers, Hash, Trash2, Minus, ArrowRight, Diamond, Hexagon, Wand2, Eraser } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WorkspaceDraw() {
  const [activeTool, setActiveTool] = useState("pen");
  const [activeLayer, setActiveLayer] = useState("circle-1");
  const [shapes, setShapes] = useState<any[]>([
    { id: 'circle-1', name: 'Circle A', type: 'circle', cx: 300, cy: 300, r: 100 }
  ]);
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      setIsDrawing(true);
      return;
    }

    if (activeTool === 'mouse' || activeTool === 'move') {
      return;
    }
    
    setIsDrawing(true);
    const id = `shape-${Date.now()}`;
    if (activeTool === 'pen' || activeTool === 'magic-pen') {
      setCurrentShape({ id, name: activeTool === 'magic-pen' ? 'AI Path' : 'Path', type: 'path', points: [{ x, y }], isMagic: activeTool === 'magic-pen' });
    } else if (activeTool === 'square') {
      setCurrentShape({ id, name: `Rectangle`, type: 'rect', startX: x, startY: y, x, y, w: 0, h: 0 });
    } else if (activeTool === 'circle') {
      setCurrentShape({ id, name: `Circle`, type: 'circle', cx: x, cy: y, r: 0 });
    } else if (activeTool === 'triangle') {
      setCurrentShape({ id, name: `Triangle`, type: 'triangle', startX: x, startY: y, x, y, w: 0, h: 0 });
    } else if (activeTool === 'line') {
      setCurrentShape({ id, name: `Line`, type: 'line', x1: x, y1: y, x2: x, y2: y });
    } else if (activeTool === 'arrow') {
      setCurrentShape({ id, name: `Arrow`, type: 'arrow', x1: x, y1: y, x2: x, y2: y });
    } else if (activeTool === 'diamond') {
      setCurrentShape({ id, name: `Diamond`, type: 'diamond', startX: x, startY: y, x, y, w: 0, h: 0 });
    } else if (activeTool === 'hexagon') {
      setCurrentShape({ id, name: `Hexagon`, type: 'hexagon', startX: x, startY: y, x, y, w: 0, h: 0 });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      // Basic sweep erase: check distance to shapes
      setShapes(prev => prev.filter(shape => {
        if (shape.type === 'circle') {
          const dist = Math.sqrt((x - shape.cx)**2 + (y - shape.cy)**2);
          return dist > shape.r;
        } else if (shape.type === 'rect' || shape.type === 'diamond' || shape.type === 'hexagon' || shape.type === 'triangle') {
          const sx = shape.w < 0 ? shape.startX + shape.w : shape.startX;
          const sy = shape.h < 0 ? shape.startY + shape.h : shape.startY;
          const w = Math.abs(shape.w);
          const h = Math.abs(shape.h);
          return !(x >= sx && x <= sx + w && y >= sy && y <= sy + h);
        } else if (shape.type === 'path') {
          // just check bounding box of path roughly
          const minX = Math.min(...shape.points.map((p:any) => p.x));
          const maxX = Math.max(...shape.points.map((p:any) => p.x));
          const minY = Math.min(...shape.points.map((p:any) => p.y));
          const maxY = Math.max(...shape.points.map((p:any) => p.y));
          return !(x >= minX && x <= maxX && y >= minY && y <= maxY);
        }
        return true;
      }));
      return;
    }

    if (!currentShape) return;

    if (currentShape.type === 'path') {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, { x, y }]
      });
    } else if (currentShape.type === 'rect' || currentShape.type === 'triangle' || currentShape.type === 'diamond' || currentShape.type === 'hexagon') {
      const w = x - currentShape.startX;
      const h = y - currentShape.startY;
      setCurrentShape({
        ...currentShape,
        w,
        h
      });
    } else if (currentShape.type === 'circle') {
      const r = Math.sqrt(Math.pow(x - currentShape.cx, 2) + Math.pow(y - currentShape.cy, 2));
      setCurrentShape({
        ...currentShape,
        r
      });
    } else if (currentShape.type === 'line' || currentShape.type === 'arrow') {
      setCurrentShape({
        ...currentShape,
        x2: x,
        y2: y
      });
    }
  };

  const handlePointerUp = async () => {
    setIsDrawing(false);
    
    if (activeTool === 'eraser') {
      return;
    }

    if (currentShape) {
      if (currentShape.isMagic && currentShape.points.length > 5) {
        setIsProcessingAI(true);
        try {
          const res = await fetch('http://localhost:8000/api/recognize-and-beautify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: currentShape.points })
          });
          const data = await res.json();
          if (data.type) {
            const newShape = {
              id: currentShape.id,
              name: `AI ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`,
              type: data.type,
              cx: data.cx, cy: data.cy, r: data.r,
              startX: data.startX, startY: data.startY,
              w: data.w, h: data.h
            };
            setShapes(prev => [...prev, newShape]);
            setActiveLayer(currentShape.id);
          } else {
            setShapes(prev => [...prev, currentShape]);
            setActiveLayer(currentShape.id);
          }
        } catch (e) {
          console.error(e);
          setShapes(prev => [...prev, currentShape]);
          setActiveLayer(currentShape.id);
        }
        setIsProcessingAI(false);
      } else {
        setShapes(prev => [...prev, currentShape]);
        setActiveLayer(currentShape.id);
      }
      setCurrentShape(null);
    }
  };

  const renderShape = (shape: any, isActive: boolean) => {
    const stroke = isActive ? "#1A73E8" : "#5F6368";
    
    // allow shape to act as eraser hit target
    const eraserProps = activeTool === 'eraser' ? {
      onPointerEnter: (e: any) => { if(isDrawing) deleteShape(shape.id, e) },
      onPointerDown: (e: any) => deleteShape(shape.id, e),
      style: { cursor: 'crosshair', pointerEvents: 'all' as any }
    } : { style: { pointerEvents: 'none' as any } };

    if (shape.type === 'path') {
      const d = shape.points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return <path key={shape.id} d={d} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...eraserProps} />;
    } else if (shape.type === 'rect') {
      const x = shape.w < 0 ? shape.startX + shape.w : shape.startX;
      const y = shape.h < 0 ? shape.startY + shape.h : shape.startY;
      const w = Math.abs(shape.w);
      const h = Math.abs(shape.h);
      return <rect key={shape.id} x={x} y={y} width={w} height={h} fill="transparent" stroke={stroke} strokeWidth="3" {...eraserProps} />;
    } else if (shape.type === 'circle') {
      return <circle key={shape.id} cx={shape.cx} cy={shape.cy} r={shape.r} fill="transparent" stroke={stroke} strokeWidth="3" {...eraserProps} />;
    } else if (shape.type === 'triangle') {
      const x1 = shape.startX + shape.w / 2;
      const y1 = shape.startY;
      const x2 = shape.startX;
      const y2 = shape.startY + shape.h;
      const x3 = shape.startX + shape.w;
      const y3 = shape.startY + shape.h;
      return <polygon key={shape.id} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="transparent" stroke={stroke} strokeWidth="3" strokeLinejoin="round" {...eraserProps} />;
    } else if (shape.type === 'line') {
      return <line key={shape.id} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={stroke} strokeWidth="3" strokeLinecap="round" {...eraserProps} />;
    } else if (shape.type === 'arrow') {
      const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
      const headlen = 15;
      const ax1 = shape.x2 - headlen * Math.cos(angle - Math.PI / 6);
      const ay1 = shape.y2 - headlen * Math.sin(angle - Math.PI / 6);
      const ax2 = shape.x2 - headlen * Math.cos(angle + Math.PI / 6);
      const ay2 = shape.y2 - headlen * Math.sin(angle + Math.PI / 6);
      return (
        <g key={shape.id} {...eraserProps}>
          <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <polygon points={`${shape.x2},${shape.y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={stroke} />
        </g>
      );
    } else if (shape.type === 'diamond') {
      const cx = shape.startX + shape.w / 2;
      const cy = shape.startY + shape.h / 2;
      return <polygon key={shape.id} points={`${cx},${shape.startY} ${shape.startX + shape.w},${cy} ${cx},${shape.startY + shape.h} ${shape.startX},${cy}`} fill="transparent" stroke={stroke} strokeWidth="3" strokeLinejoin="round" {...eraserProps} />;
    } else if (shape.type === 'hexagon') {
      const cx = shape.startX + shape.w / 2;
      const cy = shape.startY + shape.h / 2;
      const w = Math.abs(shape.w) / 2;
      const h = Math.abs(shape.h) / 2;
      const points = [
        `${cx},${cy - h}`,
        `${cx + w},${cy - h/2}`,
        `${cx + w},${cy + h/2}`,
        `${cx},${cy + h}`,
        `${cx - w},${cy + h/2}`,
        `${cx - w},${cy - h/2}`
      ].join(' ');
      return <polygon key={shape.id} points={points} fill="transparent" stroke={stroke} strokeWidth="3" strokeLinejoin="round" {...eraserProps} />;
    }
  };

  const deleteShape = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShapes(prev => prev.filter(s => s.id !== id));
    if (activeLayer === id) setActiveLayer("");
  };

  const activeShapeData = shapes.find(s => s.id === activeLayer);

  return (
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.documentName}>Bản vẽ thông minh AI</div>
        </div>
        
        <div className={styles.topbarCenter}>
          <div className={styles.toolGroup}>
            <button className={`${styles.toolBtn} ${activeTool === 'mouse' ? styles.active : ''}`} onClick={() => setActiveTool('mouse')} title="Select (V)">
              <MousePointer2 size={18} />
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e2e1', margin: '0 4px', alignSelf: 'center' }}></div>
            
            <button className={`${styles.toolBtn} ${activeTool === 'pen' ? styles.active : ''}`} onClick={() => setActiveTool('pen')} title="Pen (P)">
              <PenTool size={18} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'magic-pen' ? styles.active : ''}`} onClick={() => setActiveTool('magic-pen')} title="Bút AI (Nắn hình tự động)">
              <Wand2 size={18} color={activeTool === 'magic-pen' ? '#1A73E8' : '#F59E0B'} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'eraser' ? styles.active : ''}`} onClick={() => setActiveTool('eraser')} title="Cục Tẩy">
              <Eraser size={18} />
            </button>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e2e1', margin: '0 4px', alignSelf: 'center' }}></div>
            <button className={`${styles.toolBtn} ${activeTool === 'square' ? styles.active : ''}`} onClick={() => setActiveTool('square')} title="Rectangle (R)">
              <Square size={18} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'circle' ? styles.active : ''}`} onClick={() => setActiveTool('circle')} title="Circle (O)">
              <Circle size={18} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'triangle' ? styles.active : ''}`} onClick={() => setActiveTool('triangle')} title="Triangle (T)">
              <Triangle size={18} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'diamond' ? styles.active : ''}`} onClick={() => setActiveTool('diamond')} title="Diamond (D)">
              <Diamond size={18} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'hexagon' ? styles.active : ''}`} onClick={() => setActiveTool('hexagon')} title="Hexagon (H)">
              <Hexagon size={18} />
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e2e1', margin: '0 4px', alignSelf: 'center' }}></div>
            <button className={`${styles.toolBtn} ${activeTool === 'line' ? styles.active : ''}`} onClick={() => setActiveTool('line')} title="Line (L)">
              <Minus size={18} />
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'arrow' ? styles.active : ''}`} onClick={() => setActiveTool('arrow')} title="Arrow (A)">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <button className={styles.iconBtn} title="Download">
            <Download size={18} />
          </button>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarHeader}>
            <Layers size={16} strokeWidth={1.5} />
            <span>Layers</span>
          </div>
          <div className={styles.layerList}>
            {shapes.map(shape => (
              <div 
                key={shape.id}
                className={`${styles.layerItem} ${activeLayer === shape.id ? styles.layerActive : ''}`}
                onClick={() => setActiveLayer(shape.id)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {shape.type === 'circle' && <Circle size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'rect' && <Square size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'triangle' && <Triangle size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'diamond' && <Diamond size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'hexagon' && <Hexagon size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'line' && <Minus size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'arrow' && <ArrowRight size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'path' && shape.name.includes("AI") && <Wand2 size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  {shape.type === 'path' && !shape.name.includes("AI") && <PenTool size={14} strokeWidth={1.5} color={activeLayer === shape.id ? "#1A73E8" : "#5F6368"} />}
                  <span className={styles.layerName}>{shape.name}</span>
                </div>
                <button onClick={(e) => deleteShape(shape.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {shapes.length === 0 && (
              <div style={{ padding: '20px', color: '#5f6368', fontSize: '12px', textAlign: 'center' }}>
                Chưa có hình nào. Chọn công cụ bên trên và vẽ.
              </div>
            )}
          </div>
        </aside>

        <main className={styles.canvasArea}>
          <svg 
            className={`${styles.drawingSvg} ${activeTool === 'eraser' ? styles.eraserCursor : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none', width: '100%', height: '100%' }}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {shapes.map(shape => renderShape(shape, activeLayer === shape.id))}
            {currentShape && renderShape(currentShape, true)}
          </svg>
          
          {isProcessingAI && (
            <div style={{ position: 'absolute', top: 20, right: 20, background: '#1A73E8', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)', animation: 'pulse 1.5s infinite' }}>
              <Wand2 size={16} /> AI đang nắn hình...
            </div>
          )}
        </main>

        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarHeader}>
            <Settings size={16} strokeWidth={1.5} />
            <span>Properties</span>
          </div>
          
          {activeShapeData ? (
            <div className={styles.propertySection}>
              <div className={styles.sectionTitle}>SHAPE DATA</div>
              <div className={styles.analysisRow}>
                <span>Type</span>
                <span className={styles.analysisValue} style={{ textTransform: 'capitalize' }}>
                  {activeShapeData.type}
                </span>
              </div>
              
              {(activeShapeData.type === 'circle') && (
                <>
                  <div className={styles.analysisRow}>
                    <span>Center X</span>
                    <span className={styles.analysisValue}>{Math.round(activeShapeData.cx)}</span>
                  </div>
                  <div className={styles.analysisRow}>
                    <span>Center Y</span>
                    <span className={styles.analysisValue}>{Math.round(activeShapeData.cy)}</span>
                  </div>
                  <div className={styles.analysisRow}>
                    <span>Radius</span>
                    <span className={styles.analysisValue}>{Math.round(activeShapeData.r)}</span>
                  </div>
                </>
              )}
              
              {(activeShapeData.type === 'rect' || activeShapeData.type === 'triangle' || activeShapeData.type === 'diamond' || activeShapeData.type === 'hexagon') && (
                <>
                  <div className={styles.analysisRow}>
                    <span>Width</span>
                    <span className={styles.analysisValue}>{Math.round(Math.abs(activeShapeData.w))}</span>
                  </div>
                  <div className={styles.analysisRow}>
                    <span>Height</span>
                    <span className={styles.analysisValue}>{Math.round(Math.abs(activeShapeData.h))}</span>
                  </div>
                </>
              )}
              
              {activeShapeData.type === 'path' && (
                <div className={styles.analysisRow}>
                  <span>Points</span>
                  <span className={styles.analysisValue}>{activeShapeData.points?.length || 0}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '20px', color: '#5f6368', fontSize: '12px', textAlign: 'center' }}>
              Select a shape to view properties
            </div>
          )}
        </aside>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .eraserCursor { cursor: crosshair !important; }
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.8; }
        }
      `}} />
    </div>
  );
}
