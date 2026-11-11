# CÀ PHÊ 458 - GIAO DIỆN FRONT-END (WEB APP)

Hệ thống giao diện người dùng (Front-End) cho Hệ thống Quản lý và Gọi món tại bàn bằng mã QR của quán **Cà phê 458**. Ứng dụng phục vụ hai nhóm đối tượng chính: **Khách hàng** (gọi món qua mã QR tại bàn) và **Chủ quán / Quản trị viên** (quản lý đơn hàng, thực đơn, sơ đồ bàn, doanh thu, tài khoản).

---

## 📱 Điểm nổi bật & Quy chuẩn thiết kế

* **Thiết kế Mobile-First:** Tối ưu hóa cho màn hình di động chuẩn **390px** (iPhone 14 / Web Mobile tiêu chuẩn), căn giữa màn hình với nền kem ấm áp.
* **Đồng bộ nhận diện thương hiệu:**
  * Màu chủ đạo (Primary Red): `#D1342C`
  * Nền ấm (Warm Ivory): `#FAF6EE`
  * Nút hành động & Điểm nhấn (Action Green): `#2F5D50`
  * Chữ & Tiêu đề (Primary Text): `#22201C`
  * Viền & Phân cách: `#E8E0D2`
  * Nút xóa & Cảnh báo (Red Accent): `#8A2424`
* **Phông chữ chuẩn:** `"Be Vietnam Pro"` trên toàn bộ các thành phần giao diện.
* **Chế độ hoạt động kép (Dual Mode):**
  * Tích hợp Axios kết nối trực tiếp với Back-End API (`http://localhost:8000/api/v1`).
  * Tích hợp sẵn Mock Data & Storage cục bộ (SessionStorage, LocalStorage), cho phép khởi chạy, tương tác và kiểm thử mượt mà **100% 16 màn hình** ngay cả khi chưa bật Back-End.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **Core Framework:** React 18.2, TypeScript 5.2
* **Build Tool & Bundler:** Vite 5.1
* **Styling:** Tailwind CSS 3.4
* **Routing:** React Router DOM v6
* **State & Data Management:** React Context API (`CartContext`, `AuthContext`), TanStack React Query
* **Icons:** Custom SVG Figma chuẩn hóa kết hợp Lucide React

---

## 📑 Danh mục 16 màn hình & Ánh xạ Use Case

Hệ thống đáp ứng trọn vẹn 16 màn hình (U1 - U16) và 8 Use Cases theo tài liệu đặc tả kiến trúc:

| Mã UI | Màn hình | Đối tượng | Use Case | Đường dẫn Route |
|:---:|:---|:---:|:---:|:---|
| **U1** | Thực đơn chọn món | Khách hàng | UC 7.1, 7.2 | `/menu?qr=ban03` |
| **U2** | Giỏ hàng & Thanh toán | Khách hàng | UC 7.2 | `/checkout` |
| **U3** | Thanh toán Chuyển khoản | Khách hàng | UC 7.2 | `/payment-transfer` |
| **U4** | Thanh toán Tiền mặt | Khách hàng | UC 7.2 | `/payment-cash` |
| **U5** | Đăng nhập Chủ quán | Chủ quán | UC 1 | `/login` |
| **U6** | Trang chủ Quản trị | Chủ quán | UC 1, UC 8 | `/admin` |
| **U7** | Danh sách Đơn hàng | Chủ quán | UC 2.1, 2.2, 2.3 | `/admin/orders` |
| **U8** | Chi tiết Đơn hàng | Chủ quán | UC 2.1, 2.2, 2.3 | `/admin/orders/:id` |
| **U9** | Quản lý Thực đơn (Menu) | Chủ quán | UC 3.1, 3.3 | `/admin/menu` |
| **U10** | Thêm món mới | Chủ quán | UC 3.2 | `/admin/menu/add` |
| **U11** | Cập nhật món | Chủ quán | UC 3.4 | `/admin/menu/edit/:id` |
| **U12** | Sơ đồ & Quản lý bàn | Chủ quán | UC 4.1, 4.3, 4.4 | `/admin/tables` |
| **U13** | Thêm bàn & Sinh mã QR | Chủ quán | UC 4.2 | `/admin/tables/add` & `/admin/tables/:id` |
| **U14** | Báo cáo Tổng doanh thu | Chủ quán | UC 5.1 | `/admin/revenue` |
| **U15** | Chi tiết Doanh thu & Món | Chủ quán | UC 5.2, 5.3 | `/admin/revenue/detail` |
| **U16** | Đổi mật khẩu | Chủ quán | UC 6 | `/admin/change-password` |

---

## 🚀 Hướng dẫn Cài đặt & Chạy trên Local (Setup & Run)

### 1. Yêu cầu hệ thống
* **Node.js:** Phiên bản `>= 18.0.0` (khuyến nghị Node 20 LTS).
* **Package Manager:** `npm` (đi kèm Node.js) hoặc `yarn`, `pnpm`.

### 2. Các bước cài đặt chi tiết

#### Bước 1: Mở Terminal và di chuyển vào thư mục Front-End
```bash
# Từ thư mục gốc của dự án:
cd Front-End
```

#### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```
*(Trên Windows PowerShell, nếu gặp lỗi về Script Execution Policy khi chạy lệnh `npm`, bạn có thể dùng `npm.cmd install` hoặc mở qua `cmd`).*

#### Bước 3: Cấu hình biến môi trường (Tùy chọn)
Tạo tệp `.env` từ `.env.example` nếu cần trỏ đến máy chủ Back-End khác cổng mặc định:
```bash
# Windows Command Prompt:
copy .env.example .env

# Linux / MacOS:
cp .env.example .env
```
Nội dung mặc định trong tệp `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
*(Nếu Back-End chưa chạy, Front-End sẽ tự động kích hoạt chế độ Mock Service đầy đủ để bạn thử nghiệm mà không gặp lỗi kết nối).*

#### Bước 4: Khởi chạy máy chủ phát triển (Development Server)
```bash
npm run dev
```
Hoặc trên Windows PowerShell:
```powershell
npm.cmd run dev
```

Sau khi chạy lệnh, Terminal sẽ hiển thị đường dẫn:
```
  VITE v5.1.6  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

Mở trình duyệt (hoặc bật chế độ Responsive Device Toolbar `F12` mô phỏng iPhone 14/15) và truy cập:
👉 **`http://localhost:5173`**

---

### 3. Các lệnh hữu ích khác

* **Kiểm tra cú pháp TypeScript & Build thành phẩm Production:**
  ```bash
  npm run build
  ```
  *(Đầu ra tạo thư mục `Front-End/dist` tối ưu nén gzip sẵn sàng triển khai).*

* **Chạy thử bản Build Production (Preview):**
  ```bash
  npm run preview
  ```

---

## 🔑 Dữ liệu Thử nghiệm (Demo Credentials)

### 1. Phân hệ Khách hàng (Quét mã QR tại bàn)
Truy cập trực tiếp với tham số bàn:
* **Bàn 03:** `http://localhost:5173/menu?qr=ban03`
* **Bàn 01:** `http://localhost:5173/menu?qr=ban01`
* **Bàn 05:** `http://localhost:5173/menu?qr=ban05`
* **Thử mã QR hỏng / bàn không tồn tại:** `http://localhost:5173/menu?qr=invalid`

### 2. Thông tin Chuyển khoản của Quán (VietQR)
Khi khách chọn phương thức *"Chuyển khoản"*, hệ thống tự động tạo mã QR VietQR NAPAS 247 chính xác:
* **Ngân hàng:** `VPBank` (Ngân hàng TMCP Việt Nam Thịnh Vượng)
* **Số tài khoản:** `616108751`
* **Chủ tài khoản:** `HKD CA PHE 458`
* **Nội dung chuyển khoản:** Tự động sinh `Bàn XX`
* **Số tiền:** Tự động khớp tổng giá trị giỏ hàng

### 3. Phân hệ Chủ quán (Đăng nhập quản trị)
Truy cập: `http://localhost:5173/login`
* **Tên đăng nhập:** `chuquan458`
* **Mật khẩu ban đầu:** `123456`
*(Sau khi vào hệ thống, bạn có thể bấm Avatar "C" -> chọn "Đổi mật khẩu" để đổi sang mật khẩu mới. Mật khẩu mới sẽ được ghi nhớ trực tiếp).*

---

## 📂 Cấu trúc thư mục nguồn (`Front-End/src`)

```
Front-End/src/
├── components/                 # Các thành phần UI dùng chung
│   ├── admin/
│   │   └── OrderDatePickerModal.tsx # Bộ chọn ngày lọc đơn theo lịch
│   ├── auth/
│   │   └── ProtectedRoute.tsx  # Bảo vệ tuyến đường bắt buộc đăng nhập
│   ├── common/
│   │   ├── CoffeeCupIcon.tsx   # Icon ly cà phê thương hiệu
│   │   ├── EmptyClipboardIcon.tsx # Icon trạng thái danh sách rỗng
│   │   ├── ModalActionDialog.tsx  # Hộp thoại xác nhận 2 nút (Hủy/Xóa, Không/Có)
│   │   ├── ModalConfirm.tsx    # Popup thông báo (Tích xanh thành công / Capsule cảnh báo)
│   │   └── QrCodeCard.tsx      # Bộ sinh và kết xuất mã QR bàn để tải ảnh PNG
│   └── layout/
│       ├── AdminLayout.tsx     # Layout chuẩn của Chủ quán (Header, Tab bar 5 tab, Dropdown)
│       └── CustomerLayout.tsx  # Layout chuẩn của Khách hàng
├── constants/                  # Hằng số cấu hình hệ thống
│   ├── bank.ts                 # Cấu hình tài khoản ngân hàng VPBank của quán
│   ├── colors.ts               # Bảng màu thiết kế chuẩn Figma
│   └── messages.ts             # Các chuỗi thông báo nghiệp vụ
├── contexts/                   # Quản lý trạng thái toàn cục (State Context)
│   ├── AuthContext.tsx         # Phiên đăng nhập, token, quyền truy cập của chủ quán
│   └── CartContext.tsx         # Giỏ hàng, số bàn, ghi chú, phương thức thanh toán
├── pages/                      # Các trang màn hình giao diện
│   ├── admin/
│   │   ├── AddDishPage.tsx     # U10: Thêm món mới
│   │   ├── AddTablePage.tsx    # U13: Thêm bàn & cấp mã QR
│   │   ├── ChangePasswordPage.tsx # U16: Đổi mật khẩu
│   │   ├── EditDishPage.tsx    # U11: Cập nhật thông tin món
│   │   ├── HomePage.tsx        # U6: Trang chủ Admin
│   │   ├── LoginPage.tsx       # U5: Đăng nhập
│   │   ├── MenuListPage.tsx    # U9: Danh sách thực đơn của quán
│   │   ├── OrderDetailPage.tsx # U8: Chi tiết đơn hàng & xác nhận tiền
│   │   ├── OrderListPage.tsx   # U7: Quản lý danh sách đơn hàng
│   │   ├── RevenueDetailPage.tsx # U15: Chi tiết doanh thu theo kỳ & món bán chạy
│   │   ├── RevenueSummaryPage.tsx # U14: Báo cáo tổng doanh thu
│   │   ├── TableDetailPage.tsx # Chi tiết bàn, xác nhận bàn trống
│   │   └── TableListPage.tsx   # U12: Sơ đồ bàn
│   └── customer/
│       ├── CheckoutPage.tsx    # U2: Giỏ hàng, ghi chú, chọn thanh toán
│       ├── MenuPage.tsx        # U1: Thực đơn khách quét QR
│       ├── PaymentCashPage.tsx # U4: Thanh toán tiền mặt
│       └── PaymentTransferPage.tsx # U3: Thanh toán chuyển khoản VietQR
├── routes/
│   └── AppRoutes.tsx           # Khai báo cây điều hướng toàn hệ thống
├── services/                   # Tầng gọi API & Mock Service offline
│   ├── adminMenuService.ts     # Thao tác dữ liệu Menu admin
│   ├── adminOrderService.ts    # Thao tác dữ liệu đơn hàng
│   ├── api.ts                  # Axios Client instance
│   ├── authService.ts          # Xác thực, đăng nhập, đổi mật khẩu
│   ├── menuService.ts          # Lấy thực đơn cho khách quét QR
│   ├── orderService.ts         # Tạo đơn từ khách hàng
│   ├── revenueService.ts       # Báo cáo doanh thu và bán hàng
│   └── tableService.ts         # Sơ đồ bàn, tạo QR và trạng thái bàn
├── types/                      # Định nghĩa kiểu dữ liệu TypeScript
└── utils/
    └── formatCurrency.ts       # Định dạng tiền tệ VNĐ (ví dụ: 30.000 đ)
```

---

## 🛡️ Kiểm tra chất lượng & Tiêu chuẩn đóng gói

* Hệ thống được kiểm tra biên dịch nghiêm ngặt bằng TypeScript Compiler:
  ```bash
  npm run build
  # Kết quả: tsc && vite build hoàn tất thành công 100% với 0 lỗi cú pháp / kiểu dữ liệu.
  ```
* Mọi hành động xóa (xóa món, xóa bàn, xóa đơn) đều tuân theo nghiệp vụ xóa mềm (Soft Delete - đánh dấu trạng thái) theo đúng quy định phân tích thiết kế hệ thống.
