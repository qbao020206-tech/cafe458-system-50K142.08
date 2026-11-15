# ☕ CÀ PHÊ 458 — BACK-END API SERVICE

Dịch vụ máy chủ API Back-End cho Hệ thống Bán hàng và Quản lý quán **Cà phê 458** (458 Trưng Nữ Vương, Đà Nẵng). Hệ thống phục vụ xử lý luồng đặt món tự động qua mã QR tại bàn, quản lý đơn hàng theo thời gian thực, quản lý thực đơn, sơ đồ bàn, đồng bộ ảnh món lên Cloud Storage và sinh mã chuyển khoản ngân hàng chuẩn quốc gia **VietQR**.

---

## 🌐 1. ĐƯỜNG DẪN MÁY CHỦ TRỰC TUYẾN (PRODUCTION)

Dịch vụ Back-End được đóng gói dưới dạng Docker container và triển khai liên tục trên nền tảng **Render**:

* **Máy chủ API gốc (Base URL):** [https://cafe458.onrender.com](https://cafe458.onrender.com)
* **Tài liệu kiểm thử Swagger UI:** [https://cafe458.onrender.com/docs](https://cafe458.onrender.com/docs)
* **Tài liệu kiểm thử ReDoc:** [https://cafe458.onrender.com/redoc](https://cafe458.onrender.com/redoc)
* **Kiểm tra trạng thái máy chủ (Health Check):** [https://cafe458.onrender.com/api/v1/health](https://cafe458.onrender.com/api/v1/health)

---

## 🔑 2. TÀI KHOẢN VÀ XÁC THỰC QUẢN TRỊ (CREDENTIALS)

Toàn bộ các API trong nhóm `/admin/*` đều được bảo vệ nghiêm ngặt bằng cơ chế **Bearer Token (JWT)**. Mật khẩu được mã hóa an toàn bằng thuật toán `bcrypt`.

| Tên đăng nhập (`ten_dang_nhap`) | Mật khẩu ban đầu (`mat_khau`) | Vai trò / Mục đích |
| :---: | :---: | :--- |
| **`admin_cafe458`** | `MatKhauChuQuan458!` | **Tài khoản Chủ quán chính thức** — Quản trị toàn bộ đơn hàng, menu, bàn và báo cáo doanh thu |
| **`admin`** | `Admin@123456` | **Tài khoản Quản trị viên phụ** — Phục vụ kiểm thử API tự động |

> 💡 **Khởi tạo tài khoản:** Chạy lệnh `python scripts/seed_owner.py` để tự động tạo mới hoặc cập nhật tài khoản chủ quán ban đầu vào bảng `chu_quan`.

---

## 🛠️ 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

* **Ngôn ngữ & Framework:** Python `3.12+`, FastAPI (Kiến trúc bất đồng bộ Async/Await hoàn toàn)
* **Xác thực dữ liệu:** Pydantic v2 & Pydantic-Settings
* **ORM & Database Driver:** SQLAlchemy 2.0 Async kết hợp `asyncpg`
* **Cơ sở dữ liệu:** PostgreSQL 15+ trên nền tảng Supabase (Hỗ trợ Row Level Security - RLS)
* **Lưu trữ đám mây:** Supabase Object Storage (Bucket công khai `menu-images`)
* **Quản lý Migration:** Alembic
* **Bảo mật & Mã hóa:** `bcrypt` (băm mật khẩu), `PyJWT` (cấp phát và kiểm tra JWT token)
* **Thanh toán VietQR:** Thư viện `qrcode[pil]` sinh chuỗi payload EMVCo và render mã QR dạng Base64 PNG trực tiếp trong bộ nhớ RAM
* **Công cụ quản lý gói:** `uv` (tương thích hoàn toàn với `pip` và `requirements.txt`)

---

## 🗄️ 4. THIẾT KẾ CƠ SỞ DỮ LIỆU (5 BẢNG LÕI)

Cơ sở dữ liệu được chuẩn hóa và quản lý bởi SQLAlchemy Models trong `app/infrastructure/model_registry.py`:

```
chu_quan (Chủ quán)
 ├── ten_dang_nhap (PK, VARCHAR 50)
 └── mat_khau (VARCHAR 100, bcrypt hash)

ban (Bàn)
 ├── ma_ban (PK, INT)
 ├── ten_dang_nhap (FK -> chu_quan.ten_dang_nhap)
 ├── so_ban (VARCHAR 20, Ràng buộc UNIQUE cho các bàn chưa xóa)
 ├── ma_qr (VARCHAR 100, UNIQUE)
 ├── trang_thai (ENUM: 'Trống', 'Đang phục vụ')
 └── da_xoa (BOOLEAN, mặc định False - Xóa mềm)

mon (Món)
 ├── ma_mon (PK, INT)
 ├── ten_mon (VARCHAR 100, Ràng buộc UNIQUE không phân biệt hoa thường cho món chưa xóa)
 ├── gia_ban (NUMERIC 12,2 > 0)
 ├── hinh_anh (TEXT, URL ảnh từ Supabase Storage)
 ├── trang_thai (ENUM: 'Hiển thị', 'Ẩn')
 └── da_xoa (BOOLEAN, mặc định False - Xóa mềm)

don_hang (Đơn hàng)
 ├── ma_don_hang (PK, INT)
 ├── ma_ban (FK -> ban.ma_ban)
 ├── phuong_thuc_thanh_toan (ENUM: 'Chuyển khoản', 'Tiền mặt')
 ├── trang_thai (ENUM: 'Chưa xác nhận thanh toán', 'Đã xác nhận thanh toán')
 ├── tong_tien (NUMERIC 12,2 >= 0)
 ├── thoi_gian_dat (TIMESTAMP WITH TIME ZONE)
 ├── thoi_gian_giao_dich (TIMESTAMP WITH TIME ZONE, chỉ có khi Đã xác nhận)
 ├── ghi_chu (TEXT)
 └── da_xoa (BOOLEAN, mặc định False - Xóa mềm)

chi_tiet_don (Chi tiết đơn)
 ├── ma_don_hang (PK, FK -> don_hang.ma_don_hang)
 ├── ma_mon (PK, FK -> mon.ma_mon)
 ├── ten_mon (VARCHAR 100, Lưu lại tên món tại thời điểm đặt)
 ├── gia (NUMERIC 12,2 > 0, Lưu lại đơn giá tại thời điểm đặt)
 └── so_luong (INT > 0)
```

---

## 📂 5. CẤU TRÚC THƯ MỤC BACK-END

```text
Back-End/
├── alembic/                  # Các file di chuyển lược đồ CSDL
│   └── versions/             # File migration (0001_initial_schema.py...)
├── app/
│   ├── core/                 # Cấu hình hệ thống (config.py, errors.py)
│   ├── infrastructure/       # Kết nối CSDL (database.py, model_registry.py)
│   ├── modules/              # Phân chia nghiệp vụ theo Domain-Driven
│   │   ├── auth/             # Xác thực chủ quán (login, password, JWT)
│   │   ├── menu/             # Quản lý thực đơn & upload ảnh món ăn
│   │   ├── orders/           # Tạo đơn, duyệt đơn, thông báo đơn mới, VietQR
│   │   ├── sales/            # Báo cáo doanh thu & món bán chạy nhất
│   │   └── tables/           # Sơ đồ bàn, tạo mã QR, dọn bàn trống
│   ├── system/               # Endpoint kiểm tra trạng thái (/api/v1/health)
│   └── main.py               # Điểm khởi chạy FastAPI & thiết lập CORS
├── scripts/                  # Kịch bản dòng lệnh hỗ trợ
│   └── seed_owner.py         # Khởi tạo tài khoản chủ quán vào database
├── tests/                    # Toàn bộ test suite kiểm thử tự động
├── .env.example              # Mẫu biến môi trường
├── Dockerfile                # Cấu hình container chạy máy chủ Production
├── pyproject.toml            # Khai báo cấu hình dự án Python
├── requirements.txt          # Danh mục thư viện cố định
└── alembic.ini               # Cấu hình Alembic
```

---

## ⚙️ 6. CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

Tạo file `Back-End/.env` dựa trên file mẫu `.env.example`:

```env
# Kết nối PostgreSQL Supabase (Khuyến nghị dùng IPv4 Session Pooler cổng 5432)
DATABASE_URL=postgresql+asyncpg://postgres.xxxx:yyyy@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# Cấu hình Supabase Storage lưu ảnh món ăn
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxx
SUPABASE_STORAGE_BUCKET=menu-images

# Bảo mật JWT
JWT_SECRET=cafe458_secret_jwt_key_danang_2026_super_safe
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=12

# Tài khoản khởi tạo ban đầu
OWNER_USERNAME=admin_cafe458
OWNER_PASSWORD=MatKhauChuQuan458!

# Cấu hình tài khoản ngân hàng VPBank (VietQR NAPAS 247)
BANK_BIN=970432
BANK_NAME=VPBank
BANK_ACCOUNT_NO=616108751
BANK_ACCOUNT_NAME=HKD CA PHE 458

# Cấu hình URL Front-End (Dùng để cấp mã QR và mở CORS)
FRONTEND_BASE_URL=https://cafe458-system-50-k142-08.vercel.app,http://localhost:5173
```

---

## 🚀 7. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN LOCAL

### Cách 1: Sử dụng công cụ `uv` (Khuyến nghị)
```bash
# 1. Cài đặt Python và đồng bộ thư viện
uv python install 3.12
uv sync

# 2. Cập nhật lược đồ CSDL và tạo tài khoản chủ quán
uv run alembic upgrade head
uv run python scripts/seed_owner.py

# 3. Khởi chạy máy chủ API
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Cách 2: Sử dụng `pip` và `venv` truyền thống
```bash
# 1. Tạo môi trường ảo Python
python -m venv .venv

# 2. Kích hoạt môi trường ảo
# Trên Windows:
.venv\Scripts\activate
# Trên Linux/MacOS:
source .venv/bin/activate

# 3. Cài đặt các gói thư viện
pip install -r requirements.txt

# 4. Chạy migration và seed dữ liệu
alembic upgrade head
python scripts/seed_owner.py

# 5. Khởi động máy chủ API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🐳 8. TRIỂN KHAI VỚI DOCKER

Dự án có sẵn `Dockerfile` tối ưu dựa trên image `python:3.12-slim`:

```bash
# Xây dựng Docker Image
docker build -t cafe458-backend .

# Khởi chạy Container
docker run -d -p 8000:8000 --env-file .env --name cafe458-api cafe458-backend
```

---

## 📑 9. DANH MỤC API ENDPOINTS (`/api/v1`)

| Nhóm chức năng | Phương thức | Đường dẫn Endpoint | Yêu cầu Bearer Token | Mô tả nghiệp vụ |
| :--- | :---: | :--- | :---: | :--- |
| **Hệ thống** | `GET` | `/api/v1/health` | Không | Kiểm tra trạng thái máy chủ (`{"status": "ok"}`) |
| **Xác thực** | `POST` | `/api/v1/auth/login` | Không | Đăng nhập chủ quán, trả về Bearer JWT token |
| | `POST` | `/api/v1/auth/logout` | Có | Đăng xuất chủ quán |
| | `PUT` | `/api/v1/auth/password` | Có | Đổi mật khẩu chủ quán |
| **Khách hàng** | `GET` | `/api/v1/customer/menu?qr={token}` | Không | Xem thực đơn hợp lệ & Top 3 món bán chạy nhất |
| | `POST` | `/api/v1/customer/orders/preview` | Không | Xem trước đơn hàng, tính tổng tiền & tạo mã VietQR |
| | `POST` | `/api/v1/customer/orders` | Không | Xác nhận gửi đơn, đổi bàn sang 'Đang phục vụ' |
| **Đơn hàng** | `GET` | `/api/v1/admin/orders?date=YYYY-MM-DD` | Có | Danh sách đơn hàng theo ngày |
| | `GET` | `/api/v1/admin/orders/{id}` | Có | Xem chi tiết đơn hàng |
| | `PATCH` | `/api/v1/admin/orders/{id}/confirm-payment` | Có | Xác nhận đã nhận tiền (Tiền mặt hoặc Chuyển khoản) |
| | `DELETE` | `/api/v1/admin/orders/{id}` | Có | Xóa mềm đơn hàng |
| | `GET` | `/api/v1/admin/notifications/unread-orders` | Có | Đếm số lượng đơn chưa xác nhận (Polling thông báo) |
| **Thực đơn** | `GET` | `/api/v1/admin/menu` | Có | Danh sách toàn bộ món ăn trong menu của quán |
| | `POST` | `/api/v1/admin/menu` | Có | Thêm món ăn mới |
| | `PUT` | `/api/v1/admin/menu/{id}` | Có | Cập nhật tên, giá bán, hình ảnh, trạng thái món |
| | `DELETE` | `/api/v1/admin/menu/{id}` | Có | Xóa mềm món ăn |
| | `POST` | `/api/v1/admin/menu/upload-image` | Có | Tải ảnh món ăn trực tiếp lên Supabase Storage |
| **Bàn & QR** | `GET` | `/api/v1/admin/tables` | Có | Danh sách tất cả bàn và trạng thái hiện tại |
| | `POST` | `/api/v1/admin/tables` | Có | Thêm bàn mới & tự động sinh mã QR |
| | `GET` | `/api/v1/admin/tables/{id}/qr-image` | Có | Tải hình ảnh mã QR bàn để in ấn |
| | `DELETE` | `/api/v1/admin/tables/{id}` | Có | Xóa mềm bàn ăn |
| | `PATCH` | `/api/v1/admin/tables/{id}/empty` | Có | Đưa bàn về trạng thái 'Trống' sau khi xong ca |
| **Báo cáo** | `GET` | `/api/v1/admin/reports/revenue` | Có | Báo cáo tổng doanh thu theo ngày / tháng / năm |
| | `GET` | `/api/v1/admin/reports/details` | Có | Chi tiết doanh thu theo giờ và danh sách món bán chạy |

---

## 🧪 10. CHẠY KIỂM THỬ TỰ ĐỘNG (AUTOMATED TESTING)

Chạy bộ kiểm thử tự động với `pytest`:

```bash
cd Back-End
uv run pytest -v
# Hoặc nếu dùng venv:
pytest -v
```
Bộ kiểm thử bao quát toàn bộ các luồng nghiệp vụ cốt lõi: Đăng nhập/Đổi mật khẩu, Khách hàng đặt món, Xử lý giao dịch VietQR, Chuyển trạng thái bàn, CRUD Menu và Báo cáo doanh thu.
