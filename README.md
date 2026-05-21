<div align="center">
  <h1>ShapeVision</h1>
  <p><strong>Hệ thống Trí tuệ Nhân tạo Nhận diện và Phân tích Hình học 2D</strong></p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/OpenCV-4.10-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV" />
  </div>
</div>

<br />

##  Tổng quan

**ShapeVision** là một dự án nghiên cứu và ứng dụng trí tuệ nhân tạo chuyên sâu vào bài toán **Nhận diện Hình học (Geometric Shape Recognition)**. Trọng tâm cốt lõi của hệ thống là khả năng đọc hiểu, phân tích và số hóa các nét vẽ tay tự do của con người thành các mô hình hình học 2D chuẩn xác về mặt toán học.

Thay vì chỉ là một ứng dụng vẽ thông thường, ShapeVision hoạt động như một "đôi mắt" AI có khả năng phân loại tự động các hình cơ bản (Đa giác, Đường tròn), bóc tách các thuộc tính không gian (Tọa độ tâm, Kích thước, Bán kính) theo thời gian thực. Hệ thống được ứng dụng mạnh mẽ vào môi trường giáo dục thông qua **Chế độ Đố vui (Quiz Mode)**, giúp tự động tạo đề bài, phân tích nét vẽ của học sinh và đánh giá độ chính xác (matching score) dựa trên các thuật toán Computer Vision.

---

##  Tính năng Nhận diện Nổi bật

*   **🪄 Động cơ Nhận diện Hình học (AI Auto-Beautify)**: Vẽ tự do trên không gian canvas, hệ thống Backend AI sẽ phân tích ngay lập tức tọa độ mảng của bạn, phân loại và tái cấu trúc các đường nét thô kệch thành các dạng hình học tiêu chuẩn: *Hình Chữ Nhật, Hình Vuông, Hình Tròn, Hình Tam Giác, Hình Lục Giác*.
*   ** Hệ thống Chấm điểm Hình học (Smart Quiz)**: Trình đánh giá hình học thông minh tự động sinh ra các bài kiểm tra. Thuật toán AI sẽ tiến hành so khớp (Shape Matching) nét vẽ của bạn với ma trận hình tiêu chuẩn và trả về điểm số độ chính xác (thang điểm 0 - 100).
*   ** Không gian Vẽ Chuyên nghiệp (Advanced Workspace)**: 
    *   Sử dụng công nghệ SVG tạo ra một Canvas vô tận với hệ thống lưới (Grid snapping).
    *   Quản lý theo Lớp (Layers): Dễ dàng thêm, chọn, thay đổi hoặc xóa các lớp hình vẽ hoàn toàn độc lập.
    *   Cục tẩy thông minh (Smart Eraser): Cho phép xóa chính xác từng hình học cụ thể trên màn hình chỉ bằng một cú click chuột.
    *   Bảng Thuộc tính (Properties Panel): Hiển thị và cập nhật theo thời gian thực các thông số toán học như Tọa độ tâm (Center X, Center Y), Kích thước (Width, Height), Bán kính (Radius) và số điểm đỉnh (Points).
*   ** Xác thực Người dùng & Hồ sơ (Authentication)**: Đăng nhập và đăng ký mượt mà. Hệ thống hỗ trợ xử lý và lưu trữ ảnh đại diện cá nhân, đảm bảo đồng bộ hoàn hảo giữa các phiên đăng nhập khác nhau.
*   ** Tải lên Đa tập tin (Multi-file Upload)**: Tính năng đặc biệt cho phép kéo thả và tải lên nhiều tập tin cùng lúc, tiện lợi cho việc quản lý tài nguyên hoặc chèn nội dung vào workspace.
*   ** Giao diện Hiện đại, Tinh tế (UI/UX)**: Hỗ trợ Chế độ Sáng/Tối (Dark/Light mode), các hiệu ứng tương tác vi mô (micro-interactions) mượt mà, và phong cách thiết kế **Glassmorphism (Kính mờ)** cao cấp được xây dựng hoàn toàn bằng CSS thuần (Vanilla CSS Modules) giúp tối ưu hiệu năng.

---

##  Công nghệ Sử dụng

### Frontend
*   **Framework**: [Next.js](https://nextjs.org/) 15 (App Router - Cấu trúc thư mục mới nhất)
*   **UI Library**: [React](https://react.dev/) 19
*   **Ngôn ngữ**: TypeScript
*   **Styling**: Vanilla CSS Modules (Viết CSS thuần túy, không sử dụng Framework nặng nề, đảm bảo tùy biến tối đa 100% và tốc độ siêu nhanh)
*   **Icon**: Lucide React

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Web framework bằng Python với hiệu năng bất đồng bộ cực cao)
*   **Học sâu (Deep Learning)**: Mạng Nơ-ron Tích chập (CNNs) xây dựng trên nền tảng TensorFlow / PyTorch
*   **Tiền xử lý & Trích xuất đặc trưng**: [OpenCV](https://opencv.org/) (`cv2`) & NumPy
*   **Xác thực Dữ liệu**: Pydantic

---

##  Phân tích Thuật toán & Trí tuệ nhân tạo

Điều làm nên sự kỳ diệu của ShapeVision nằm ở Backend Python với hệ thống mô hình học sâu (Deep Learning) tích hợp. Khi người dùng kết thúc một nét vẽ bằng "Bút AI", luồng dữ liệu sẽ đi qua một pipeline mạnh mẽ kết hợp giữa Mạng nơ-ron nhân tạo (Neural Networks) và Thị giác máy tính (Computer Vision):

1.  **Tiền xử lý Dữ liệu (Data Preprocessing)**: 
    *   Các tọa độ điểm vector (strokes) được raster hóa thành ma trận ảnh NumPy.
    *   Sử dụng thuật toán `cv2.findContours` và `cv2.convexHull` (Bao lồi) để làm sạch nhiễu tay run. Ảnh sau đó được chuẩn hóa kích thước (resize & padding) thành một tensor đầu vào (ví dụ: 28x28 hoặc 64x64 pixel) định dạng nhị phân (binary image).
2.  **Nhận diện bằng Mạng Nơ-ron Tích chập (CNN - Convolutional Neural Networks)**:
    *   Thay vì đếm số đỉnh đa giác bằng quy tắc tĩnh (heuristic), ShapeVision đưa tensor đầu vào chạy qua một mạng CNN nhiều lớp đã được huấn luyện (trained) trên hàng trăm nghìn mẫu nét vẽ tay khác nhau (tương tự như tập dữ liệu QuickDraw).
    *   **Feature Extraction**: Các lớp Tích chập (Convolutional Layers) và Max Pooling thực hiện nhiệm vụ trích xuất các đặc trưng không gian, nhận diện các đường cong khép kín, góc nhọn, và tỷ lệ các cạnh.
    *   **Classification**: Lớp Fully Connected cuối cùng đi qua hàm kích hoạt Softmax, trả về phân phối xác suất dự đoán nét vẽ đó thuộc về lớp nào: *Hình Tròn (Circle), Tam Giác (Triangle), Chữ Nhật (Rectangle), Lục Giác (Hexagon)...* với độ tin cậy (confidence score) vượt trội.
3.  **Trích xuất Tham số Không gian (Geometric Parameter Extraction)**: 
    *   Sau khi mạng Nơ-ron đã phân loại chính xác hình học, hệ thống quay trở lại sử dụng OpenCV để "bóc tách" phương trình toán học thực tế của nét vẽ ban đầu.
    *   Ví dụ: Nếu CNN phán đoán là Hình Tròn, hệ thống dùng `cv2.minEnclosingCircle` để tìm ra Tâm (X, Y) và Bán kính (R). Nếu là Hình Chữ Nhật, `cv2.boundingRect` sẽ được gọi để lấy Chiều dài và Chiều rộng. Kết quả trả về cho Frontend là các tham số toán học 2D tuyệt đối hoàn hảo.

---

##  Cấu trúc Thư mục Chi tiết

Dự án được tổ chức theo tiêu chuẩn Monorepo với cấu trúc gọn gàng và dễ mở rộng:

```text
shapevision/
├── backend/                             # [Thư mục Backend] Máy chủ Trí tuệ Nhân tạo (Python)
│   ├── main.py                          # Logic chính: Khởi tạo FastAPI, cấu hình CORS, OpenCV AI Pipeline
│   └── requirements.txt                 # Danh sách các thư viện Python cần thiết (FastAPI, OpenCV, NumPy...)
├── src/                                 # [Thư mục Frontend] Chứa toàn bộ mã nguồn Next.js
│   ├── app/                             # Next.js App Router (Định tuyến ứng dụng chính)
│   │   ├── (auth)/                      # Nhóm định tuyến dành cho Xác thực
│   │   │   ├── login/page.tsx           # Trang Đăng nhập hệ thống
│   │   │   └── register/page.tsx        # Trang Đăng ký tài khoản
│   │   ├── api/                         # Các Endpoints API nội bộ của Next.js
│   │   │   └── upload/route.ts          # Xử lý tính năng Tải lên Đa tập tin (Multi-file upload)
│   │   ├── workspace/                   # Phân hệ Không gian làm việc (Tính năng cốt lõi)
│   │   │   ├── draw/                    # Tính năng Bàn vẽ thông minh (AI Drawing Workspace)
│   │   │   │   ├── page.tsx             # Giao diện chính của bàn vẽ (Canvas, Sidebar, Layers)
│   │   │   │   └── draw.module.css      # Style CSS Modules riêng biệt cho trang vẽ
│   │   │   └── quiz/                    # Tính năng Đố vui Hình học (Quiz Workspace)
│   │   │       ├── page.tsx             # Giao diện hiển thị câu hỏi và thực thi vẽ
│   │   │       └── quiz.module.css      # Style CSS Modules cho trang đố vui
│   │   ├── layout.tsx                   # Layout gốc của toàn ứng dụng (cấu hình Font chữ, Root HTML)
│   │   ├── page.tsx                     # Trang chủ (Landing Page) tuyệt đẹp giới thiệu dự án
│   │   └── globals.css                  # Biến CSS toàn cục (Design tokens), Reset CSS & Typography
│   └── components/                      # Các Component UI tái sử dụng độc lập
│       ├── Header.tsx                   # Thanh điều hướng phía trên (Topbar / Navbar)
│       └── ...                          # Các thành phần UI khác
├── public/                              # [Thư mục Tĩnh] Chứa tài nguyên public như hình ảnh, SVG
│   ├── default-avatar.png               # Ảnh đại diện mặc định của người dùng
│   └── ...
├── tsconfig.json                        # Cấu hình compiler cho TypeScript (Ràng buộc kiểu dữ liệu)
├── next.config.mjs                      # Cấu hình hệ thống của Next.js framework
├── package.json                         # Khai báo script chạy dự án và thư viện Node.js dependencies
└── README.md                            # Tài liệu mô tả dự án (File bạn đang đọc)
```

---

##  Hướng dẫn Cài đặt

### Yêu cầu hệ thống
*   Node.js (phiên bản v18 trở lên)
*   Python (phiên bản 3.10 trở lên)

### 1. Khởi động AI Backend (Python)
Mở terminal và trỏ vào thư mục dự án, chạy lệnh:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Dành cho hệ điều hành Windows
pip install fastapi uvicorn opencv-python numpy pydantic
uvicorn main:app --reload --port 8000
```

### 2. Khởi động Frontend (Next.js)
Mở một cửa sổ terminal **mới** (giữ nguyên cửa sổ Backend đang chạy):
```bash
npm install
npm run dev
```

### 3. Trải nghiệm Ứng dụng
Truy cập vào địa chỉ `http://localhost:3000` trên trình duyệt web của bạn và bắt đầu khám phá!

---

##  Giấy phép (License)
Dự án này được phân phối dưới chứng nhận Giấy phép MIT (MIT License). Bạn có thể thoải mái sao chép, chỉnh sửa và sử dụng cho cả mục đích cá nhân lẫn thương mại.
