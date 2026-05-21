"use client";

import styles from "./Footer.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on workspace and dashboard to avoid breaking 100vh layout
  const isAppPage = pathname?.startsWith("/workspace") || pathname === "/dashboard";
  
  if (isAppPage) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="ShapeVision Logo" height="24" />
            <span>ShapeVision</span>
          </div>
          <p>Nền tảng phân tích và nhận diện hình học bằng AI.</p>
        </div>
        <div className={styles.footerLinks}>
          <div className={styles.linkColumn}>
            <h4>Sản phẩm</h4>
            <Link href="/docs">Tài liệu</Link>
            <Link href="#">Tính năng</Link>
            <Link href="#">Bảng giá</Link>
          </div>
          <div className={styles.linkColumn}>
            <h4>Công ty</h4>
            <Link href="#">Về chúng tôi</Link>
            <Link href="#">Tuyển dụng</Link>
            <Link href="#">Liên hệ</Link>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2024 ShapeVision AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
