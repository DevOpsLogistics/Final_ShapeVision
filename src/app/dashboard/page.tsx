"use client";

import styles from "./dashboard.module.css";
import { Search, FolderGit2, PenTool, Image as ImageIcon, CheckCircle, Trash2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
interface Project {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
}

const BADGE_MAP: Record<string, string> = {
  "2D Drawing": "badgeGreen",
  "3D Model": "badgeBlue",
  "Hand-drawn": "badgePurple",
  "Quiz Result": "badgeYellow",
};

const SVG_MAP: Record<string, React.ReactNode> = {
  "2D Drawing": (
    <svg viewBox="0 0 100 100"><polygon points="20,80 50,20 80,80" stroke="#1c1b1b" strokeWidth="2" fill="none" /></svg>
  ),
  "3D Model": (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="35" stroke="#1c1b1b" strokeWidth="1" fill="none" />
      <ellipse cx="50" cy="50" rx="35" ry="10" stroke="#1c1b1b" strokeWidth="1" fill="none" />
      <ellipse cx="50" cy="50" rx="10" ry="35" stroke="#1c1b1b" strokeWidth="1" fill="none" />
    </svg>
  ),
  "Hand-drawn": (
    <svg viewBox="0 0 100 100">
      <path d="M50,20 C70,18 85,35 80,55 C75,75 55,85 35,75 C15,65 15,40 30,25 C40,15 48,22 50,20" stroke="#1c1b1b" strokeWidth="2" fill="none" />
    </svg>
  ),
  "Quiz Result": (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="25" stroke="#5F6368" strokeWidth="2" fill="none" />
      <text x="50" y="58" fontSize="24" fill="#5F6368" textAnchor="middle">?</text>
    </svg>
  ),
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return "Vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.name) setUserName(user.name);
    } catch { /* ignore */ }

    // Fetch projects
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateWorkspace() {
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Workspace mới - ${new Date().toLocaleDateString("vi-VN")}`, type: "2D Drawing" }),
      });
      const data = await res.json();
      if (data.project) {
        setProjects((prev) => [data.project, ...prev]);
      }
    } catch { /* ignore */ }
    setCreating(false);
  }

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Dashboard Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e5e2e1", backgroundColor: "#fff" }}>
        <div className={styles.searchBar}>
          <Search size={18} color="#5F6368" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button className={styles.primaryButton} onClick={handleCreateWorkspace} disabled={creating}>
          {creating ? "Đang tạo..." : "Tạo Workspace mới"}
        </button>
      </div>

      <div className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.navMenu}>
            <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
              <FolderGit2 size={18} />
              Tất cả dự án
            </Link>
            <div className={styles.navDivider}></div>
            <Link href="/workspace/draw" className={styles.navItem}>
              <PenTool size={18} />
              Bản vẽ tay
            </Link>
            <div className={styles.navDivider}></div>
            <Link href="/workspace/upload" className={styles.navItem}>
              <ImageIcon size={18} />
              Ảnh đã tải
            </Link>
            <div className={styles.navDivider}></div>
            <Link href="/workspace/quiz" className={styles.navItem}>
              <CheckCircle size={18} />
              Kết quả Quiz
            </Link>
            <div className={styles.navDivider}></div>
            <Link href="/settings" className={styles.navItem}>
              <Search size={18} />
              Cài đặt
            </Link>
          </nav>
        </aside>

        {/* Main Content (Project Grid) */}
        <main className={styles.content}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#5f6368" }}>Đang tải dự án...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#5f6368" }}>Không tìm thấy dự án nào.</div>
          ) : (
            <div className={styles.projectGrid}>
              {filtered.map((project) => (
                <Link href={`/workspace/${project.type === 'Quiz Result' ? 'quiz' : project.type === '3D Model' ? '3d' : 'draw'}`} className={styles.card} key={project.id} style={{textDecoration: 'none'}}>
                  <div className={styles.cardThumbnail}>
                    <div className={styles.gridBg}></div>
                    <span className={`${styles.badge} ${styles[BADGE_MAP[project.type] || "badgeGreen"]}`}>
                      {project.type}
                    </span>
                    <div className={styles.graphic}>
                      {SVG_MAP[project.type] || SVG_MAP["2D Drawing"]}
                    </div>
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <div className={styles.cardTime}>
                      <Clock size={12} /> {formatTime(project.updatedAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
