"use client";

import styles from "./3d.module.css";
import { RefreshCw, ChevronDown } from "lucide-react";
import { useState } from "react";

const SHAPES = [
  { id: 'sphere', name: 'Hình Cầu' },
  { id: 'cylinder', name: 'Hình Trụ' },
  { id: 'cone', name: 'Hình Nón' },
  { id: 'cube', name: 'Hình Lập Phương' },
  { id: 'rectangular_prism', name: 'Hình Hộp Chữ Nhật' },
  { id: 'hexagonal_prism', name: 'Lăng Trụ Lục Giác' },
];

export default function Workspace3D() {
  const [rotation, setRotation] = useState(0);
  const [selectedShape, setSelectedShape] = useState('sphere');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputs, setInputs] = useState({
    radius: '',
    height: '',
    side: '',
    length: '',
    width: ''
  });
  
  const [results, setResults] = useState<{
    volume?: { value: number; formula: string };
    surface_area?: { value: number; formula: string };
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  const calculate = async () => {
    setIsLoading(true);
    setResults(null);
    try {
      const payload = {
        shape_type: selectedShape,
        radius: inputs.radius ? parseFloat(inputs.radius) : undefined,
        height: inputs.height ? parseFloat(inputs.height) : undefined,
        side: inputs.side ? parseFloat(inputs.side) : undefined,
        length: inputs.length ? parseFloat(inputs.length) : undefined,
        width: inputs.width ? parseFloat(inputs.width) : undefined,
      };

      const res = await fetch("http://localhost:8000/api/calculate-3d", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        alert("Có lỗi xảy ra: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối tới server");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputs = () => {
    switch (selectedShape) {
      case 'sphere':
        return (
          <div className={styles.formGroup}>
            <label className={styles.label}>Bán kính (r)</label>
            <input type="number" name="radius" value={inputs.radius} onChange={handleInputChange} className={styles.input} />
          </div>
        );
      case 'cylinder':
      case 'cone':
        return (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Bán kính đáy (r)</label>
              <input type="number" name="radius" value={inputs.radius} onChange={handleInputChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Chiều cao (h)</label>
              <input type="number" name="height" value={inputs.height} onChange={handleInputChange} className={styles.input} />
            </div>
          </>
        );
      case 'cube':
        return (
          <div className={styles.formGroup}>
            <label className={styles.label}>Cạnh (a)</label>
            <input type="number" name="side" value={inputs.side} onChange={handleInputChange} className={styles.input} />
          </div>
        );
      case 'rectangular_prism':
        return (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Chiều dài (l)</label>
              <input type="number" name="length" value={inputs.length} onChange={handleInputChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Chiều rộng (w)</label>
              <input type="number" name="width" value={inputs.width} onChange={handleInputChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Chiều cao (h)</label>
              <input type="number" name="height" value={inputs.height} onChange={handleInputChange} className={styles.input} />
            </div>
          </>
        );
      case 'hexagonal_prism':
        return (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Cạnh đáy (a)</label>
              <input type="number" name="side" value={inputs.side} onChange={handleInputChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Chiều cao (h)</label>
              <input type="number" name="height" value={inputs.height} onChange={handleInputChange} className={styles.input} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderFormulaInfo = () => {
    switch (selectedShape) {
      case 'sphere':
        return (
          <>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Thể tích:</span>
              <span className={styles.mathFormula}>V = (4/3)πr³</span>
            </div>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Diện tích:</span>
              <span className={styles.mathFormula}>S = 4πr²</span>
            </div>
          </>
        );
      case 'cylinder':
        return (
          <>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Thể tích:</span>
              <span className={styles.mathFormula}>V = πr²h</span>
            </div>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Diện tích TP:</span>
              <span className={styles.mathFormula}>S<sub className={styles.sub}>tp</sub> = 2πr(r+h)</span>
            </div>
          </>
        );
      case 'cone':
        return (
          <>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Thể tích:</span>
              <span className={styles.mathFormula}>V = (1/3)πr²h</span>
            </div>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Diện tích TP:</span>
              <span className={styles.mathFormula}>S<sub className={styles.sub}>tp</sub> = πr(r + l)</span>
            </div>
          </>
        );
      case 'cube':
        return (
          <>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Thể tích:</span>
              <span className={styles.mathFormula}>V = a³</span>
            </div>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Diện tích TP:</span>
              <span className={styles.mathFormula}>S<sub className={styles.sub}>tp</sub> = 6a²</span>
            </div>
          </>
        );
      case 'rectangular_prism':
        return (
          <>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Thể tích:</span>
              <span className={styles.mathFormula}>V = l×w×h</span>
            </div>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Diện tích TP:</span>
              <span className={styles.mathFormula}>S<sub className={styles.sub}>tp</sub> = 2(lw + wh + lh)</span>
            </div>
          </>
        );
      case 'hexagonal_prism':
      default:
        return (
          <>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Thể tích:</span>
              <span className={styles.mathFormula}>V = S<sub className={styles.sub}>đáy</sub> × h</span>
            </div>
            <div className={styles.formulaRow}>
              <span className={styles.textLabel}>Diện tích TP:</span>
              <span className={styles.mathFormula}>S<sub className={styles.sub}>tp</sub> = 2S<sub className={styles.sub}>đáy</sub> + S<sub className={styles.sub}>xq</sub></span>
            </div>
          </>
        );
    }
  };

  const renderSVG = () => {
    switch (selectedShape) {
      case 'sphere':
        return (
          <g transform="translate(0, -20)">
            <circle cx="200" cy="200" r="80" fill="rgba(26, 115, 232, 0.1)" stroke="#1a3258" strokeWidth="2" />
            <ellipse cx="200" cy="200" rx="80" ry="30" fill="none" stroke="#5B7C99" strokeWidth="1" strokeDasharray="5,5" />
            <ellipse cx="200" cy="200" rx="80" ry="30" fill="none" stroke="#1a3258" strokeWidth="2" strokeDasharray="5,5" transform="rotate(90 200 200)" />
          </g>
        );
      case 'cylinder':
        return (
          <g transform="translate(0, -20)">
            <ellipse cx="200" cy="120" rx="60" ry="25" fill="rgba(26, 115, 232, 0.15)" stroke="#1a3258" strokeWidth="2" />
            <path d="M140,120 L140,260 A60,25 0 0,0 260,260 L260,120" fill="rgba(26, 115, 232, 0.1)" stroke="#1a3258" strokeWidth="2" />
            <path d="M140,260 A60,25 0 0,1 260,260" fill="none" stroke="#5B7C99" strokeWidth="1" strokeDasharray="5,5" />
          </g>
        );
      case 'cone':
        return (
          <g transform="translate(0, -20)">
            <path d="M140,250 A60,25 0 0,0 260,250 L200,100 Z" fill="rgba(26, 115, 232, 0.1)" stroke="#1a3258" strokeWidth="2" strokeLinejoin="round" />
            <path d="M140,250 A60,25 0 0,1 260,250" fill="none" stroke="#5B7C99" strokeWidth="1" strokeDasharray="5,5" />
          </g>
        );
      case 'cube':
      case 'rectangular_prism':
        // Simplified cube/prism
        return (
          <g transform="translate(0, -20)">
            {/* Back face */}
            <polygon points="170,120 250,120 250,200 170,200" fill="rgba(26, 115, 232, 0.05)" stroke="#5B7C99" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="170" y1="120" x2="130" y2="160" stroke="#5B7C99" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="170" y1="200" x2="130" y2="240" stroke="#5B7C99" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="250" y1="120" x2="210" y2="160" stroke="#1a3258" strokeWidth="2" />
            <line x1="250" y1="200" x2="210" y2="240" stroke="#1a3258" strokeWidth="2" />
            
            {/* Front face */}
            <polygon points="130,160 210,160 210,240 130,240" fill="rgba(26, 115, 232, 0.1)" stroke="#1a3258" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Top face */}
            <polygon points="170,120 250,120 210,160 130,160" fill="rgba(26, 115, 232, 0.15)" stroke="#1a3258" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Right face */}
            <polygon points="210,160 250,120 250,200 210,240" fill="rgba(26, 115, 232, 0.1)" stroke="#1a3258" strokeWidth="2" strokeLinejoin="round" />
          </g>
        );
      case 'hexagonal_prism':
      default:
        return (
          <g transform="translate(0, -20)">
            <polygon points="170,120 230,120 260,137 230,154 170,154 140,137" fill="rgba(26, 115, 232, 0.05)" stroke="#5B7C99" strokeWidth="1" />
            <polygon points="170,240 230,240 260,257 230,274 170,274 140,257" fill="rgba(26, 115, 232, 0.05)" stroke="#5B7C99" strokeWidth="1" />
            <line x1="170" y1="120" x2="170" y2="240" stroke="#5B7C99" strokeWidth="1" />
            <line x1="230" y1="120" x2="230" y2="240" stroke="#5B7C99" strokeWidth="1" />
            <polygon points="170,120 230,120 260,137 230,154 170,154 140,137" fill="rgba(26, 115, 232, 0.1)" stroke="#1a3258" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="170,240 230,240 260,257 230,274 170,274 140,257" fill="rgba(26, 115, 232, 0.15)" stroke="#1a3258" strokeWidth="2" strokeLinejoin="round" />
            <line x1="140" y1="137" x2="140" y2="257" stroke="#1a3258" strokeWidth="2" />
            <line x1="170" y1="154" x2="170" y2="274" stroke="#1a3258" strokeWidth="2" />
            <line x1="230" y1="154" x2="230" y2="274" stroke="#1a3258" strokeWidth="2" />
            <line x1="260" y1="137" x2="260" y2="257" stroke="#1a3258" strokeWidth="2" />
            <polygon points="140,137 170,154 170,274 140,257" fill="rgba(26, 115, 232, 0.1)" />
            <polygon points="170,154 230,154 230,274 170,274" fill="rgba(26, 115, 232, 0.15)" />
            <polygon points="230,154 260,137 260,257 230,274" fill="rgba(26, 115, 232, 0.1)" />
          </g>
        );
    }
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.mainLayout}>
        <aside className={styles.leftPanel}>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div 
              className={styles.panelTitle} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>Shape 3D: {SHAPES.find(s => s.id === selectedShape)?.name}</span>
              <ChevronDown size={20} />
            </div>
            
            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '4px', zIndex: 50, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {SHAPES.map(shape => (
                  <div 
                    key={shape.id}
                    onClick={() => {
                      setSelectedShape(shape.id);
                      setIsDropdownOpen(false);
                      setResults(null);
                    }}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', backgroundColor: selectedShape === shape.id ? '#f0fdf4' : 'transparent' }}
                  >
                    {shape.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.formulaSection}>
            {renderFormulaInfo()}
          </div>

          <div className={styles.formSection}>
            {renderInputs()}
          </div>

          <button 
            className={styles.calcButton} 
            onClick={calculate}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Đang tính toán...' : 'Tính toán'}
          </button>

          {results && (
            <div style={{ marginTop: '24px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#166534', marginBottom: '12px' }}>Kết quả:</h3>
              <div style={{ marginBottom: '8px', color: '#14532d' }}>
                <strong>Thể tích:</strong> {results.volume?.value}
                <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>{results.volume?.formula}</div>
              </div>
              <div style={{ color: '#14532d' }}>
                <strong>Diện tích TP:</strong> {results.surface_area?.value}
                <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>{results.surface_area?.formula}</div>
              </div>
            </div>
          )}
        </aside>

        <main className={styles.rightPanel}>
          <div className={styles.card3d}>
            <button 
              className={styles.rotateBtn} 
              onClick={() => setRotation((prev) => prev + 90)}
              style={{ cursor: 'pointer', zIndex: 10 }}
            >
              <RefreshCw size={24} strokeWidth={1.5} color="#1c1b1b" />
            </button>

            <div className={styles.canvas3d} style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s ease' }}>
              <svg viewBox="0 0 400 400" className={styles.svg3d}>
                <g stroke="#e5e2e1" strokeWidth="1" className={styles.gridLines}>
                  <line x1="200" y1="50" x2="200" y2="350" stroke="#c1c6d6" strokeWidth="1.5" />
                  <text x="200" y="40" className={styles.axisLabel} textAnchor="middle">Z</text>
                  
                  <line x1="200" y1="200" x2="50" y2="286.6" stroke="#c1c6d6" strokeWidth="1.5" />
                  <text x="40" y="296" className={styles.axisLabel} textAnchor="middle">X</text>
                  
                  <line x1="200" y1="200" x2="350" y2="286.6" stroke="#c1c6d6" strokeWidth="1.5" />
                  <text x="360" y="296" className={styles.axisLabel} textAnchor="middle">Y</text>

                  <line x1="200" y1="170" x2="80" y2="239.2" />
                  <line x1="200" y1="170" x2="320" y2="239.2" />
                  <line x1="200" y1="140" x2="110" y2="191.9" />
                  <line x1="200" y1="140" x2="290" y2="191.9" />
                  <line x1="200" y1="110" x2="140" y2="144.6" />
                  <line x1="200" y1="110" x2="260" y2="144.6" />
                  
                  <line x1="160" y1="73" x2="160" y2="273" />
                  <line x1="120" y1="96" x2="120" y2="296" />
                  <line x1="240" y1="73" x2="240" y2="273" />
                  <line x1="280" y1="96" x2="280" y2="296" />
                </g>
                
                {renderSVG()}
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
