"use client";

import styles from "./Navbar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (token && user) {
          if (user.name) setUserName(user.name);
          else if (user.email) setUserName(user.email.split('@')[0]);
          if (user.avatar) setUserAvatar(user.avatar);
          else setUserAvatar("");
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch { 
        setIsLoggedIn(false);
      }
    };

    loadUser();

    // Listen for custom 'storage' events dispatched when profile is updated
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, [pathname]);

  return (
    <nav className={styles.navbar}>
      {/* Left: Logo */}
      <Link href={isLoggedIn ? "/dashboard" : "/"} className={styles.logo}>
        <img src="/logo.png" alt="ShapeVision Logo" height="32" />
        <span style={{ fontWeight: 600 }}>
          <span style={{ color: '#1a73e8' }}>Shape</span>
          <span style={{ color: 'var(--foreground)' }}>Vision</span>
        </span>
      </Link>

      {/* Middle: Navigation Links */}
      <div className={styles.navLinksCenter}>
        <Link href="/" className={styles.navLink}>Trang chủ</Link>
        <div 
          className={styles.dropdownContainer}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
          style={{ position: 'relative' }}
        >
          <Link href="/dashboard" className={styles.navLink}>
            Công cụ <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
          </Link>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu} style={{
              position: 'absolute', top: '100%', left: '0', background: 'var(--background)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '8px 0',
              minWidth: '220px', zIndex: 100, border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Link href="/workspace/draw" style={{ display: 'block', padding: '10px 20px', color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.05))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Canvas & Toán học
              </Link>
              <Link href="/workspace/upload" style={{ display: 'block', padding: '10px 20px', color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.05))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Upload Phân tích Contour
              </Link>
              <Link href="/workspace/camera" style={{ display: 'block', padding: '10px 20px', color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.05))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Camera Quét Real-time
              </Link>
              <Link href="/workspace/multi-detect" style={{ display: 'block', padding: '10px 20px', color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.05))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Nhận diện đa đối tượng
              </Link>
              <Link href="/workspace/3d" style={{ display: 'block', padding: '10px 20px', color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.05))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Mô hình hóa 3D
              </Link>
            </div>
          )}
        </div>
        <Link href="/docs" className={styles.navLink}>Tài liệu</Link>
      </div>

      {/* Right: Actions */}
      <div className={styles.actions}>
        {pathname === "/dashboard" && (
          <div className={styles.searchContainer}>
            <Search size={18} color="#5F6368" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              className={styles.searchInput}
            />
          </div>
        )}

        {!isLoggedIn ? (
          <>
            <Link href="/login" className={styles.navLink}>Đăng nhập</Link>
            <Link href="/register" className={styles.primaryButton}>Đăng ký</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={styles.navLinkButton} style={{ textDecoration: 'none', marginRight: '8px' }}>Bảng điều khiển</Link>
            
            <div 
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div className={styles.userInfo} style={{ background: isProfileDropdownOpen ? '#f8f9fa' : 'transparent' }}>
                <div className={styles.avatar}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="#5F6368"/>
                      <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" fill="#5F6368"/>
                    </svg>
                  )}
                </div>
                <span className={styles.userName}>{userName}</span>
              </div>
              
              {isProfileDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: '0', background: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '8px 0',
                  minWidth: '200px', zIndex: 100, border: '1px solid #e5e2e1', marginTop: '4px'
                }}>
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e2e1', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a' }}>{userName}</div>
                    <div style={{ fontSize: '12px', color: '#5f6368' }}>Thành viên ShapeVision</div>
                  </div>
                  <Link href="/settings" style={{ display: 'block', padding: '10px 20px', color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Quản lý hồ sơ
                  </Link>
                  <Link href="/settings" style={{ display: 'block', padding: '10px 20px', color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Cài đặt tài khoản
                  </Link>
                  <div style={{ height: '1px', background: '#e5e2e1', margin: '4px 0' }}></div>
                  <button 
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', color: '#d93025', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
                      setIsLoggedIn(false);
                      window.location.href = '/';
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
