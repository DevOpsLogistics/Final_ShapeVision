import styles from "./docs.module.css";
import Link from "next/link";
import { Book, Code, Layers, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div className={styles.container}>


      <main className={styles.content}>
        <h1 className={styles.title}>Tài liệu Hướng dẫn</h1>
        <p className={styles.subtitle}>
          Chào mừng bạn đến với tài liệu hướng dẫn của ShapeVision AI. Ở đây bạn sẽ tìm thấy mọi thông tin cần thiết để sử dụng nền tảng nhận diện hình khối của chúng tôi.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Book size={24} /> 1. Giới thiệu tổng quan</h2>
          <p className={styles.text}>
            ShapeVision là nền tảng AI phân tích và nhận diện hình học (geometric detection) cung cấp bộ công cụ toàn diện từ phân tích 2D, 3D đến đánh giá kiến trúc mô hình Neural Network.
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}><strong>Workspace Upload:</strong> Upload hình ảnh để AI tự động nhận diện và vẽ Bounding Box cho các hình dạng.</li>
            <li className={styles.listItem}><strong>Multi-Detect:</strong> Phân tích hình ảnh phức tạp với nhiều hình học đan xen, phân nhóm dữ liệu tự động.</li>
            <li className={styles.listItem}><strong>Model Compare:</strong> So sánh hiệu năng của nhiều mô hình Deep Learning khác nhau (ResNet, MobileNet, CNN).</li>
            <li className={styles.listItem}><strong>Deep Analysis:</strong> Xem chi tiết cấu trúc các layer của mô hình và các thông số đánh giá như Precision, Recall, F1-Score.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Code size={24} /> 2. Tích hợp API</h2>
          <p className={styles.text}>
            Bạn có thể gọi trực tiếp API nhận diện của chúng tôi thông qua HTTP Request. Dưới đây là ví dụ sử dụng cURL:
          </p>
          <div className={styles.codeBlock}>
            curl -X POST https://api.shapevision.ai/v1/detect \<br/>
            &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br/>
            &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
            &nbsp;&nbsp;-d '&#123;"image_url": "https://example.com/shapes.png"&#125;'
          </div>
          <p className={styles.text}>
            Kết quả trả về sẽ bao gồm danh sách các hình dạng phát hiện được (loại hình, tọa độ bounding box, độ tự tin - confidence score).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Layers size={24} /> 3. Mô hình hỗ trợ</h2>
          <p className={styles.text}>
            Hiện tại ShapeVision hỗ trợ nhận diện các hình khối cơ bản và phức tạp:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Hình vuông, Hình chữ nhật (Square, Rectangle)</li>
            <li className={styles.listItem}>Hình tròn, Hình Elip (Circle, Ellipse)</li>
            <li className={styles.listItem}>Hình tam giác (Triangle - Cân, Vuông, Đều)</li>
            <li className={styles.listItem}>Đa giác tự do (Polygons)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Zap size={24} /> 4. Trợ giúp & Hỗ trợ</h2>
          <p className={styles.text}>
            Nếu bạn gặp sự cố khi sử dụng, vui lòng liên hệ với đội ngũ kỹ thuật thông qua email <strong>support@shapevision.ai</strong> hoặc mở issue trên GitHub Repository của chúng tôi.
          </p>
        </section>
      </main>


    </div>
  );
}
