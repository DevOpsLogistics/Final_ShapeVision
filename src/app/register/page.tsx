"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../login/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại");
        return;
      }

      // Store token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Save to mock database
      try {
        const dbStr = localStorage.getItem("shapevision_users");
        let db = dbStr ? JSON.parse(dbStr) : {};
        db[data.user.email] = data.user;
        localStorage.setItem("shapevision_users", JSON.stringify(db));
      } catch (e) {
        console.error(e);
      }
      router.push("/dashboard");
    } catch {
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logo} style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}><img src="/logo.png" alt="ShapeVision Logo" height="40" /></div>
          </Link>
          <h1 className={styles.title}>Tạo tài khoản</h1>
          <p className={styles.subtitle}>Bắt đầu sử dụng ShapeVision Workspace</p>
        </div>

        <form className={styles.form} onSubmit={handleRegister}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Họ và tên</label>
            <input 
              type="text" 
              id="name" 
              className={styles.input} 
              placeholder="Nhập họ và tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input 
              type="email" 
              id="email" 
              className={styles.input} 
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              className={styles.input} 
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu</label>
            <input 
              type="password" 
              id="confirmPassword" 
              className={styles.input} 
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Hoặc</span>
        </div>

        <button type="button" className={styles.googleButton}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Đăng ký bằng tài khoản Google
        </button>

        <div className={styles.footer}>
          <span>Đã có tài khoản? </span>
          <Link href="/login" className={styles.linkText}>Đăng nhập</Link>
        </div>
      </div>
    </main>
  );
}
