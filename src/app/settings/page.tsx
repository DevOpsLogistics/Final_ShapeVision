"use client";

import styles from "./settings.module.css";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CanvasSettings {
  showGrid: boolean;
  showMeasurements: boolean;
  strokeColor: string;
  autoDetectSensitivity: number;
}

interface Settings {
  defaultModel: string;
  onDeviceInference?: boolean;
  serverApi?: boolean;
  canvas: CanvasSettings;
}

interface User {
  name?: string;
  email: string;
  avatar?: string;
}

interface HistoryItem {
  id: string;
  date: string;
  type: string;
  name: string;
}

const MODEL_OPTIONS = ["Custom CNN", "On-device Inference (TensorFlow.js)", "MobileNet V2"];
const COLOR_OPTIONS = ["#000000", "#0000FF", "#FF0000"];

const DEFAULT_SETTINGS: Settings = {
  defaultModel: "Custom CNN",
  onDeviceInference: true,
  serverApi: false,
  canvas: {
    showGrid: true,
    showMeasurements: true,
    strokeColor: "#000000",
    autoDetectSensitivity: 1.5,
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("model");
  const [user, setUser] = useState<User | null>(null);
  
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Profile Form States
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (!token || !storedUser) {
        window.location.href = '/login';
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditName(parsedUser.name || "");
      setEditEmail(parsedUser.email || "");
      setEditAvatar(parsedUser.avatar || "");

      // Load Settings
      const savedSettings = localStorage.getItem(`shapevision_settings_${parsedUser.email}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Save default settings if none exist
        localStorage.setItem(`shapevision_settings_${parsedUser.email}`, JSON.stringify(DEFAULT_SETTINGS));
      }

      // Load History
      const savedHistory = localStorage.getItem(`shapevision_history_${parsedUser.email}`);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        // Create some dummy history for the real feel
        const mockHistory = [
          { id: "1", date: new Date().toISOString(), type: "Drawing", name: "Bản nháp 1" },
          { id: "2", date: new Date(Date.now() - 86400000).toISOString(), type: "Task", name: "Bài tập Hình học Không gian" }
        ];
        localStorage.setItem(`shapevision_history_${parsedUser.email}`, JSON.stringify(mockHistory));
        setHistory(mockHistory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  function saveSettings(updated: Settings) {
    if (!user) return;
    setSettings(updated);
    setSaving(true);
    setSaveMsg("");
    try {
      localStorage.setItem(`shapevision_settings_${user.email}`, JSON.stringify(updated));
      setSaveMsg("✓ Đã lưu cài đặt");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("Lỗi khi lưu");
    }
    setSaving(false);
  }

  function toggleField(field: keyof Settings) {
    const updated = { ...settings, [field]: !settings[field] };
    saveSettings(updated);
  }

  function toggleCanvas(field: keyof CanvasSettings) {
    const updated = {
      ...settings,
      canvas: { ...settings.canvas, [field]: !settings.canvas[field] },
    };
    saveSettings(updated);
  }

  function selectModel(model: string) {
    const updated = { ...settings, defaultModel: model };
    setDropdownOpen(false);
    saveSettings(updated);
  }

  function selectColor(color: string) {
    const updated = {
      ...settings,
      canvas: { ...settings.canvas, strokeColor: color },
    };
    saveSettings(updated);
  }

  function setSensitivity(value: number) {
    const updated = {
      ...settings,
      canvas: { ...settings.canvas, autoDetectSensitivity: value },
    };
    saveSettings(updated);
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const updatedUser = { ...user, name: editName, email: editEmail, avatar: editAvatar };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Save to mock database
    try {
      const dbStr = localStorage.getItem("shapevision_users");
      let db = dbStr ? JSON.parse(dbStr) : {};
      db[updatedUser.email] = updatedUser;
      localStorage.setItem("shapevision_users", JSON.stringify(db));
    } catch (e) {
      console.error(e);
    }
    
    setUser(updatedUser);
    
    // Dispatch custom event so Navbar can hear it
    window.dispatchEvent(new Event("storage"));

    setSaveMsg("✓ Đã cập nhật hồ sơ");
    setTimeout(() => setSaveMsg(""), 2000);
    setSaving(false);
  }

  function clearHistory() {
    if (!user) return;
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      localStorage.setItem(`shapevision_history_${user.email}`, JSON.stringify([]));
      setHistory([]);
      setSaveMsg("✓ Đã xóa lịch sử");
      setTimeout(() => setSaveMsg(""), 2000);
    }
  }

  if (loading || !user) {
    return (
      <div className={styles.workspace}>
        <div style={{ textAlign: "center", padding: "60px", color: "#5f6368" }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.mainLayout}>
        {/* Left Sidebar Menu */}
        <aside className={styles.sidebar}>
          <div style={{ padding: '0 16px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Cài đặt hệ thống</h2>
          </div>
          <nav className={styles.navMenu}>
            <button 
              className={`${styles.navItem} ${activeTab === 'model' ? styles.active : ''}`}
              onClick={() => setActiveTab('model')}
              style={{ textAlign: 'left', border: 'none', background: activeTab === 'model' ? '' : 'transparent', cursor: 'pointer' }}
            >
              Cấu hình Model
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'canvas' ? styles.active : ''}`}
              onClick={() => setActiveTab('canvas')}
              style={{ textAlign: 'left', border: 'none', background: activeTab === 'canvas' ? '' : 'transparent', cursor: 'pointer' }}
            >
              Cài đặt Canvas
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'account' ? styles.active : ''}`}
              onClick={() => setActiveTab('account')}
              style={{ textAlign: 'left', border: 'none', background: activeTab === 'account' ? '' : 'transparent', cursor: 'pointer' }}
            >
              Tài khoản
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ textAlign: 'left', border: 'none', background: activeTab === 'history' ? '' : 'transparent', cursor: 'pointer' }}
            >
              Quản lý lịch sử
            </button>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h2 className={styles.sectionTitle} style={{ fontSize: '24px' }}>
                {activeTab === 'model' && "Cấu hình Model"}
                {activeTab === 'canvas' && "Cài đặt Canvas"}
                {activeTab === 'account' && "Tài khoản của tôi"}
                {activeTab === 'history' && "Lịch sử hoạt động"}
             </h2>
             {saveMsg && (
              <span
                style={{
                  color: saveMsg.startsWith("✓") ? "#188038" : "#d93025",
                  fontSize: "14px",
                  fontWeight: 500,
                  backgroundColor: saveMsg.startsWith("✓") ? "#e6f4ea" : "#fce8e6",
                  padding: "6px 12px",
                  borderRadius: "16px",
                  animation: "fadeIn 0.3s ease",
                }}
              >
                {saveMsg}
              </span>
            )}
          </div>
          
          {/* Section 1: Cấu hình Model */}
          {activeTab === 'model' && (
            <section className={styles.section}>
              <div className={styles.formGroup}>
                <div className={styles.dropdownWrapper}>
                  <label className={styles.label}>Model Mặc Định</label>
                  
                  <div
                    className={styles.dropdownBox}
                    style={{ width: "300px", cursor: "pointer" }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>{settings.defaultModel}</span>
                    <ChevronDown size={16} />
                  </div>

                  {dropdownOpen && (
                    <div className={styles.dropdownOpenBox} style={{ width: "300px", position: "absolute", zIndex: 20 }}>
                      {MODEL_OPTIONS.map((model) => (
                        <div
                          key={model}
                          className={
                            model === settings.defaultModel
                              ? styles.dropdownItemActive
                              : styles.dropdownItem
                          }
                          onClick={() => selectModel(model)}
                          style={{ cursor: "pointer" }}
                        >
                          {model}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.divider} style={{ margin: "16px 0" }}></div>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div
                    className={`${styles.toggleSwitch} ${settings.onDeviceInference ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => toggleField("onDeviceInference")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                  <span className={styles.toggleLabel}>On-device Inference (TensorFlow.js)</span>
                </div>
                <div className={styles.toggleItem}>
                  <div
                    className={`${styles.toggleSwitch} ${settings.serverApi ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => toggleField("serverApi")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                  <span className={styles.toggleLabel}>Server API</span>
                </div>
              </div>
            </section>
          )}

          {/* Section 2: Cài đặt Canvas */}
          {activeTab === 'canvas' && (
            <section className={styles.section}>
              <div className={styles.toggleGroup} style={{ marginBottom: "24px" }}>
                <div className={styles.toggleItem}>
                  <div
                    className={`${styles.toggleSwitch} ${settings.canvas.showGrid ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => toggleCanvas("showGrid")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                  <span className={styles.toggleLabel}>Hiển thị lưới tọa độ</span>
                </div>
                <div className={styles.toggleItem} style={{ marginLeft: "24px" }}>
                  <div
                    className={`${styles.toggleSwitch} ${settings.canvas.showMeasurements ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => toggleCanvas("showMeasurements")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                  <span className={styles.toggleLabel}>Hiển thị nhãn số đo</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Màu nét vẽ mặc định</label>
                <div className={styles.colorPicker}>
                  {COLOR_OPTIONS.map((color) => (
                    <div
                      key={color}
                      className={`${styles.colorCircle} ${settings.canvas.strokeColor === color ? styles.colorSelected : ""}`}
                      style={{ backgroundColor: color, cursor: "pointer" }}
                      onClick={() => selectColor(color)}
                    ></div>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: "24px" }}>
                <label className={styles.label}>Độ nhạy tự động nhận diện</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={settings.canvas.autoDetectSensitivity}
                    onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                    onMouseUp={() => saveSettings(settings)}
                    style={{
                      width: "100%",
                      accentColor: "#1A73E8",
                      height: "6px",
                    }}
                  />
                  <div className={styles.sliderLabels}>
                    <span>0.5s</span>
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {settings.canvas.autoDetectSensitivity.toFixed(1)}s
                    </span>
                    <span>3s</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Tài khoản */}
          {activeTab === 'account' && (
            <section className={styles.section}>
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                  <label className={styles.label}>Ảnh đại diện</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e5eefc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {editAvatar ? (
                        <img src={editAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4" fill="#1a73e8"/>
                          <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" fill="#1a73e8"/>
                        </svg>
                      )}
                    </div>
                    <label style={{ cursor: 'pointer', backgroundColor: '#e5e2e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                      Đổi ảnh
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd9d9', fontSize: '14px' }}
                    placeholder="Nhập tên của bạn"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd9d9', fontSize: '14px', backgroundColor: '#f8f9fa' }}
                    readOnly
                  />
                  <span style={{ fontSize: '12px', color: '#5f6368' }}>Email không thể thay đổi</span>
                </div>
                
                <button type="submit" style={{ 
                  backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 16px', 
                  borderRadius: '6px', fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' 
                }}>
                  Lưu thay đổi
                </button>
              </form>
            </section>
          )}

          {/* Section 4: Quản lý lịch sử */}
          {activeTab === 'history' && (
            <section className={styles.section}>
              <div className={styles.buttonGroup} style={{ marginBottom: '24px' }}>
                <button className={styles.actionBtn}>Xuất dữ liệu (JSON)</button>
                <button className={styles.actionBtn}>Xuất dữ liệu (CSV)</button>
                <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={clearHistory}>Xóa toàn bộ lịch sử</button>
              </div>

              <div style={{ border: '1px solid #e5e2e1', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e5e2e1', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: 500, color: '#5f6368' }}>Tên bản lưu</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500, color: '#5f6368' }}>Loại</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500, color: '#5f6368' }}>Thời gian lưu</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500, color: '#5f6368', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#5f6368' }}>
                          Chưa có lịch sử nào được lưu.
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e5e2e1' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.name}</td>
                          <td style={{ padding: '12px 16px', color: '#5f6368' }}>{item.type}</td>
                          <td style={{ padding: '12px 16px', color: '#5f6368' }}>
                            {new Date(item.date).toLocaleString('vi-VN')}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button style={{ color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Mở lại</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
