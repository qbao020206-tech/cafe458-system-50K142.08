# 📱 CÀ PHÊ 458 — GIAO DIỆN FRONT-END (WEB APP)

Ứng dụng web giao diện người dùng (Front-End) cho Hệ thống Quản lý và Gọi món tại bàn bằng mã QR của quán **Cà phê 458** (458 Trưng Nữ Vương, Hải Châu, Đà Nẵng).

Hệ thống phục vụ hai nhóm đối tượng người dùng độc lập:

1. **Khách hàng:** Quét mã QR tại bàn bằng điện thoại để xem menu, chọn món, ghi chú và thanh toán tiện lợi (Chuyển khoản VietQR hoặc Tiền mặt).
2. **Chủ quán / Quản trị viên:** Quản lý danh sách đơn hàng nhận tức thì, xác nhận thanh toán, chỉnh sửa menu món, cấu hình sơ đồ bàn và theo dõi doanh thu trực quan.

---

## 🌐 1. ĐƯỜNG DẪN TRỰC TUYẾN (PRODUCTION LINKS)

Ứng dụng Front-End được biên dịch tối ưu và triển khai phân phối toàn cầu qua mạng CDN của **Vercel**:

- **Trang chủ hệ thống:** [https://cafe458-system-50-k142-08.vercel.app](https://cafe458-system-50-k142-08.vercel.app)
- **Giao diện Khách hàng gọi món (Demo QR Bàn 01):** [https://cafe458-system-50-k142-08.vercel.app/menu?qr=ban01](https://cafe458-system-50-k142-08.vercel.app/menu?qr=ban01)
- **Giao diện Đăng nhập Quản trị Chủ quán:** [https://cafe458-system-50-k142-08.vercel.app/login](https://cafe458-system-50-k142-08.vercel.app/login)

---

## 🔑 2. TÀI KHOẢN ĐĂNG NHẬP VÀ THANH TOÁN

### 2.1. Tài khoản Đăng nhập Quản trị Chủ quán (`/login`)

| Môi trường                       |  Tên đăng nhập  |       Mật khẩu       | Ghi chú                                      |
| :------------------------------- | :-------------: | :------------------: | :------------------------------------------- |
| **Hệ thống Online (Production)** | `admin_cafe458` | `MatKhauChuQuan458!` | **Tài khoản Chủ quán chính thức**            |
| **Kiểm thử Online (Production)** |     `admin`     |    `Admin@123456`    | Tài khoản phụ kiểm thử                       |
| **Chế độ Mock / Offline**        |  `chuquan458`   |       `123456`       | Dùng khi chạy Front-End độc lập không mở API |

### 2.2. Thông tin Chuyển khoản của Quán (VietQR)

Hệ thống tự động hiển thị mã QR VietQR NAPAS 247 chính xác khi khách chọn chuyển khoản:

- **Ngân hàng:** `VPBank` (Mã BIN: `970432`)
- **Số tài khoản:** `616108751`
- **Tên thụ hưởng:** `HKD CA PHE 458`
- **Nội dung:** Tự động sinh `Bàn {Số_bàn}`

---

## 🎨 3. QUY CHUẨN THIẾT KẾ & ĐẶC TÍNH NỔI BẬT

- **Chuẩn Mobile-First 390px:** Được tối ưu hóa cho màn hình điện thoại thông minh (iPhone 14/15), tự động căn giữa trang với nền ấm dịu mắt trên màn hình máy tính để bàn.
- **Bộ nhận diện thương hiệu chuẩn Figma:**
  - Đỏ thương hiệu (Primary Red): `#D1342C`
  - Nền ấm (Warm Ivory): `#FAF6EE`
  - Xanh hành động (Action Green): `#2F5D50`
  - Chữ & Tiêu đề (Primary Text): `#22201C`
  - Đường viền (Border): `#E8E0D2`
  - Cảnh báo & Xóa (Danger Red): `#8A2424`
- **Phông chữ:** `"Be Vietnam Pro"` trên toàn bộ thành phần giao diện.
- **Cơ chế hoạt động kép (Dual Mode):**
  - Tích hợp Axios kết nối trực tiếp với Back-End API (`https://cafe458.onrender.com/api/v1` hoặc `http://localhost:8000/api/v1`).
  - Tích hợp sẵn Mock Data trong trường hợp offline, giúp kiểm thử trọn vẹn cả 16 màn hình mà không bị gián đoạn.
- **Chuông báo đơn hàng thời gian thực:** Quản trị viên tự động nhận thông báo âm thanh và đếm số đơn chưa xác nhận theo chu kỳ polling 5 giây.

---

## 📑 4. DANH MỤC 16 MÀN HÌNH (U1 — U16)

|  Mã UI  | Tên màn hình                      | Đối tượng  |     Use Case     | Đường dẫn Route                           |
| :-----: | :-------------------------------- | :--------: | :--------------: | :---------------------------------------- |
| **U1**  | Thực đơn chọn món tại bàn         | Khách hàng |  UC 7.1, UC 7.2  | `/menu?qr={ma_qr}`                        |
| **U2**  | Giỏ hàng & Chọn thanh toán        | Khách hàng |      UC 7.2      | `/checkout`                               |
| **U3**  | Thanh toán Chuyển khoản VietQR    | Khách hàng |      UC 7.2      | `/payment-transfer`                       |
| **U4**  | Thanh toán Tiền mặt tại quầy      | Khách hàng |      UC 7.2      | `/payment-cash`                           |
| **U5**  | Đăng nhập Chủ quán                |  Chủ quán  |       UC 1       | `/login`                                  |
| **U6**  | Trang chủ Quản trị                |  Chủ quán  |    UC 1, UC 8    | `/admin`                                  |
| **U7**  | Danh sách Đơn hàng                |  Chủ quán  | UC 2.1, 2.2, 2.3 | `/admin/orders`                           |
| **U8**  | Chi tiết Đơn hàng & Xác nhận tiền |  Chủ quán  | UC 2.1, 2.2, 2.3 | `/admin/orders/:id`                       |
| **U9**  | Quản lý Thực đơn (Menu)           |  Chủ quán  |   UC 3.1, 3.3    | `/admin/menu`                             |
| **U10** | Thêm món ăn mới                   |  Chủ quán  |      UC 3.2      | `/admin/menu/add`                         |
| **U11** | Chỉnh sửa thông tin món           |  Chủ quán  |      UC 3.4      | `/admin/menu/edit/:id`                    |
| **U12** | Sơ đồ & Quản lý bàn               |  Chủ quán  | UC 4.1, 4.3, 4.4 | `/admin/tables`                           |
| **U13** | Thêm bàn mới & Cấp mã QR          |  Chủ quán  |      UC 4.2      | `/admin/tables/add` & `/admin/tables/:id` |
| **U14** | Báo cáo Tổng doanh thu            |  Chủ quán  |      UC 5.1      | `/admin/revenue`                          |
| **U15** | Chi tiết Doanh thu & Món chạy     |  Chủ quán  |   UC 5.2, 5.3    | `/admin/revenue/detail`                   |
| **U16** | Đổi mật khẩu tài khoản            |  Chủ quán  |       UC 6       | `/admin/change-password`                  |

---

## 🛠️ 5. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Core Framework:** React 18.2, TypeScript 5.2
- **Build Tool:** Vite 5.1
- **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Routing:** React Router DOM v6
- **State Management:** React Context API (`CartContext`, `AuthContext`), TanStack React Query
- **HTTP Client:** Axios với Request/Response Interceptors xử lý JWT token tự động
- **Icons:** Bộ SVG tùy biến chuẩn Figma & Lucide React
- **Testing:** Vitest & React Testing Library

---

## 📂 6. CẤU TRÚC THƯ MỤC NGUỒN (`src/`)

```text
Front-End/
├── public/                     # Tài nguyên tĩnh (login-bg.png, favicon...)
├── src/
│   ├── components/             # Các thành phần tái sử dụng
│   │   ├── admin/              # Component riêng của admin (OrderDatePickerModal...)
│   │   ├── auth/               # Tuyến đường bảo vệ (ProtectedRoute...)
│   │   ├── common/             # Component chung (ModalConfirm, ModalActionDialog, QrCodeCard...)
│   │   └── layout/             # Khung sườn bố cục (AdminLayout, CustomerLayout)
│   ├── constants/              # Hằng số (cấu hình ngân hàng, mã màu, thông báo)
│   ├── contexts/               # Quản lý trạng thái Auth & Giỏ hàng toàn cục
│   ├── pages/                  # Các trang màn hình
│   │   ├── admin/              # 12 màn hình quản trị chủ quán
│   │   └── customer/           # 4 màn hình khách hàng gọi món
│   ├── routes/                 # Khai báo cây điều hướng AppRoutes.tsx
│   ├── services/               # Gọi API Axios và dữ liệu giả lập (Mock)
│   ├── types/                  # Định nghĩa kiểu dữ liệu TypeScript
│   └── utils/                  # Hàm tiện ích (định dạng tiền tệ, xử lý ngày tháng)
├── .env.example                # File mẫu biến môi trường
├── package.json                # Danh mục thư viện phụ thuộc
├── tsconfig.json               # Cấu hình TypeScript
├── vercel.json                 # Cấu hình SPA Rewrite phục vụ deploy Vercel
└── vite.config.ts              # Cấu hình Vite
```

---

## 🚀 7. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN LOCAL

### Bước 1: Mở Terminal tại thư mục Front-End

```bash
cd Front-End
```

### Bước 2: Cài đặt thư viện phụ thuộc

```bash
npm install
```

### Bước 3: Cấu hình biến môi trường

Tạo file `.env` từ file mẫu `.env.example`:

```bash
# Trên Windows:
copy .env.example .env

# Trên Linux/MacOS:
cp .env.example .env
```

Nội dung file `.env`:

```env
# URL máy chủ API Back-End:
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Hoặc trỏ trực tiếp đến máy chủ Online:
# VITE_API_BASE_URL=https://cafe458.onrender.com/api/v1
```

### Bước 4: Khởi động máy chủ phát triển

```bash
npm run dev
# Hoặc trên Windows PowerShell:
npm.cmd run dev
```

Trình duyệt mở tại địa chỉ: 👉 **`http://localhost:5173`**

---

## 📦 8. ĐÓNG GÓI & TRIỂN KHAI PRODUCTION

- **Biên dịch mã nguồn:**

  ```bash
  npm run build
  ```

  _(Toàn bộ mã nguồn TypeScript được kiểm tra kiểu nghiêm ngặt và đóng gói ra thư mục `Front-End/dist/` siêu nhẹ)._

- **Xem trước bản Build (Preview):**

  ```bash
  npm run preview
  ```

- **Cấu hình Rewrite Vercel (`vercel.json`):**
  Để tránh lỗi `404 Not Found` khi người dùng F5 tải lại các đường dẫn sâu (`/menu?qr=...`, `/admin/orders`, `/login`), dự án đã trang bị file `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 🧪 9. CHẠY KIỂM THỬ GIAO DIỆN

Chạy bộ kiểm thử tự động với Vitest:

```bash
npm test
# Hoặc:
npx vitest run
```

Kết quả kiểm thử kiểm tra toàn bộ luồng đăng nhập, chọn món, thanh toán VietQR và các modal xác nhận trạng thái.
