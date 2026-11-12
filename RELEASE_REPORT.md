# BÁO CÁO KIỂM TRA TRẠNG THÁI HỆ THỐNG TRƯỚC PHÁT HÀNH (RELEASE READINESS REPORT)

* **Dự án:** Trang web hệ thống bán hàng quán Cà phê 458 (`cafe458-system-50K142.08`)
* **Vai trò thực hiện:** Release Engineer
* **Thời điểm kiểm tra:** 13/11/2026
* **Nguyên tắc kiểm tra:** Read-only (chỉ kiểm tra bằng terminal/công cụ đọc file, không sửa code, không xóa dữ liệu).

---

## 1. Kiểm tra Git & Các thay đổi gần đây

### 1.1. Lệnh Git cơ bản
* **`git status`**:
  ```text
  On branch main
  Your branch is up to date with 'origin/main'.
  nothing to commit, working tree clean
  ```
* **`git branch --show-current`**: `main`
* **`git log -n 5 --oneline`**:
  * `f0d73dd` Cập nhật module đơn hàng, VietQR và giao diện Front-End
  * `ee06576` Cập nhật hoàn thiện hệ thống Backend và Frontend
  * `7d1fe54` Merge branch 'main' of https://github.com/qbao020206-tech/cafe458-system-50K142.08
  * `ed78653` Fix figma
  * `7b0a40f` feat: add Cafe 458 backend
* **`git diff --stat`**: Rỗng (Working tree clean, không có thay đổi uncommitted trên tracked files).

### 1.2. File cấu hình Deploy & CI/CD
* Toàn bộ repository **chưa có bất kỳ file cấu hình deploy nào**:
  * Không có: `Dockerfile`, `docker-compose.yml`
  * Không có: `vercel.json`, `netlify.toml`, `render.yaml`, `railway.json`, `Procfile`
  * Không có thư mục `.github/workflows/` (chưa thiết lập CI/CD pipeline).

### 1.3. Kiểm tra `.gitignore`
* File `.gitignore` ở thư mục gốc và `Back-End/.gitignore` đã chặn các file nhạy cảm và thư mục rác:
  * Chặn `.env`, `.env.*`, `*.env` (ngoại lệ `!.env.example`).
  * Chặn cache biên dịch: `__pycache__/`, `*.py[cod]`.
  * Chặn thư viện phụ thuộc: `node_modules/`.
  * Chặn thư mục build: `dist/`.
* **Lưu ý quan trọng cho Release:** File `.gitignore` dòng 45-46 và 74-81 đang chặn toàn bộ thư mục test (`tests/`, `Back-End/tests/`, `__tests__/`, `setupTests.ts`, `*.test.ts*`). Vì vậy, trên Git remote hiện chưa có mã kiểm thử; các test suites hiện chỉ tồn tại trên máy local.

---

## 2. Kiểm tra phần Database & Migration (PostgreSQL / Supabase)

### 2.1. Cấu trúc bảng trong SQLAlchemy Models & Alembic (`alembic/versions/0001_initial_schema.py`)
Đã đồng bộ đầy đủ **5 bảng lõi** cùng các ràng buộc nghiệp vụ:
1. **`chu_quan`**:
   * Khóa chính: `ten_dang_nhap` (VARCHAR 50).
   * Mật khẩu băm: `mat_khau` (VARCHAR 100).
2. **`ban`**:
   * Khóa chính: `ma_ban`, khóa ngoại `ten_dang_nhap` (`ON DELETE RESTRICT`).
   * ENUM trạng thái tiếng Việt: `"Trống"`, `"Đang phục vụ"` (mặc định `"Trống"`).
   * Cột xóa mềm: `da_xoa` (BOOLEAN, mặc định `false`).
   * Ràng buộc CHECK: `ck_ban_so_ban_nonempty` (`length(trim(so_ban)) > 0`).
   * Partial Unique Index: `uq_ban_so_ban_chua_xoa` trên cột `so_ban` với điều kiện `WHERE da_xoa = FALSE`.
   * Ràng buộc UNIQUE: `uq_ban_ma_qr` trên `ma_qr`.
3. **`mon`**:
   * Khóa chính: `ma_mon`, các cột `ten_mon`, `gia_ban`, `hinh_anh`.
   * ENUM trạng thái: `"Hiển thị"`, `"Ẩn"` (mặc định `"Hiển thị"`).
   * Cột xóa mềm: `da_xoa` (BOOLEAN, mặc định `false`).
   * Ràng buộc CHECK: `ck_mon_gia_ban_positive` (`gia_ban > 0`), `ck_mon_ten_mon_nonempty` (`length(trim(ten_mon)) > 0`).
   * Partial Unique Index: `uq_mon_ten_chua_xoa` trên `lower(ten_mon)` với điều kiện `WHERE da_xoa = FALSE`.
4. **`don_hang`**:
   * Khóa chính: `ma_don_hang`, khóa ngoại `ma_ban` (`ON DELETE RESTRICT`).
   * ENUM phương thức thanh toán: `"Chuyển khoản"`, `"Tiền mặt"`.
   * ENUM trạng thái đơn: `"Chưa xác nhận thanh toán"`, `"Đã xác nhận thanh toán"`.
   * Cột xóa mềm: `da_xoa` (BOOLEAN, mặc định `false`).
   * Ràng buộc CHECK logic giao dịch: `ck_don_hang_gd` (`(trang_thai = 'Đã xác nhận thanh toán') = (thoi_gian_giao_dich IS NOT NULL)`).
   * Index: `ix_don_hang_ma_ban`, `ix_don_hang_thoi_gian_dat` (partial index `WHERE da_xoa = FALSE`).
5. **`chi_tiet_don`**:
   * Khóa chính phức hợp: (`ma_don_hang`, `ma_mon`), khóa ngoại tới `don_hang` và `mon`.
   * Cột `ten_mon`, `gia`, `so_luong`.
   * Ràng buộc CHECK: `ck_chi_tiet_don_gia_positive` (`gia > 0`), `ck_chi_tiet_don_so_luong_positive` (`so_luong > 0`).
6. **Row Level Security (RLS)**:
   * Migration `0001_initial_schema.py` chứa đầy đủ 5 câu lệnh kích hoạt RLS:
     ```sql
     ALTER TABLE chu_quan ENABLE ROW LEVEL SECURITY;
     ALTER TABLE ban ENABLE ROW LEVEL SECURITY;
     ALTER TABLE mon ENABLE ROW LEVEL SECURITY;
     ALTER TABLE don_hang ENABLE ROW LEVEL SECURITY;
     ALTER TABLE chi_tiet_don ENABLE ROW LEVEL SECURITY;
     ```

### 2.2. Script Seed tài khoản chủ quán
* Script: `Back-End/scripts/seed_owner.py`.
* Đọc `OWNER_USERNAME` và `OWNER_PASSWORD` từ biến môi trường (hoặc `.env`).
* Băm mật khẩu bằng thuật toán `bcrypt` (`bcrypt.hashpw(..., bcrypt.gensalt())`).
* Cơ chế Upsert: Cập nhật nếu tài khoản đã có, tạo mới nếu chưa có.

---

## 3. Kiểm tra phần Back-End (Python + FastAPI + SQLAlchemy 2.0 async + asyncpg)

### 3.1. Thư viện phụ thuộc (`pyproject.toml` vs `requirements.txt`)
* Hiện tại **chưa có file `requirements.txt`**. Dự án quản lý dependency thông qua chuẩn `pyproject.toml` và `uv.lock`.
* Thư viện đã cấu hình:
  * `sqlalchemy[asyncio]>=2.0.40,<3.0`
  * `asyncpg>=0.30,<1.0`
  * `alembic>=1.14,<2.0`
  * `bcrypt>=4.2,<6.0` (dùng thư viện `bcrypt` độc lập)
  * `PyJWT[crypto]>=2.10,<3.0` (dùng `PyJWT`)
  * `httpx>=0.28.1` (gọi REST API của Supabase Storage)
  * `qrcode[pil]>=8.2` (Pillow và QRCode để sinh ảnh VietQR)
  * `python-multipart>=0.0.33` (upload file ảnh form-data)

### 3.2. Cấu hình biến môi trường & Kết nối Cơ sở dữ liệu
* **Đọc `DATABASE_URL`**:
  * Hàm `sqlalchemy_database_url` trong `app/core/config.py` tự động chuyển tiền tố `postgres://` hoặc `postgresql://` thành `postgresql+asyncpg://`.
  * Hỗ trợ đầy đủ kết nối Supabase qua Direct Connection (cổng 5432) và Session Pooler (cổng 5432).
  * *Lưu ý:* Tránh dùng Transaction Pooler cổng 6543 của Supabase do xung đột cơ chế prepared statement cache mặc định của `asyncpg`.
* **CORS & FRONTEND_BASE_URL**:
  * `app/main.py` khai báo: `allow_origins=[get_settings().frontend_base_url]`.
  * *Hạn chế:* Chỉ nhận một giá trị URL đơn từ biến `FRONTEND_BASE_URL`, chưa có cơ chế mảng `CORS_ORIGINS` cho nhiều origin cùng lúc.
* **Biến ngân hàng (VietQR)**:
  * Các biến `BANK_BIN`, `BANK_NAME`, `BANK_ACCOUNT_NO`, `BANK_ACCOUNT_NAME` đã được tích hợp trong `app/modules/orders/service.py`.
  * Khi khách chọn "Chuyển khoản", nếu thiếu cấu hình hệ thống trả về lỗi HTTP 503 `PAYMENT_NOT_CONFIGURED`. Nếu có đủ, hệ thống tự động sinh chuỗi chuẩn EMVCo và render Base64 Data URI PNG.

### 3.3. Tính chất lưu trữ: Stateless vs Stateful
* **Back-End hoạt động STATELESS hoàn toàn**:
  * Tải ảnh món (`upload_menu_image`): Đọc trực tiếp vào RAM bằng `BytesIO`, kiểm tra dung lượng (< 2MB) và format bằng Pillow, sau đó gọi REST API tải thẳng lên Supabase Storage bucket `menu-images`. Không lưu file ảnh vào ổ cứng local của server/container.
  * Sinh mã VietQR: Dùng `io.BytesIO` sinh base64 string trực tiếp trong memory.
  * Token QR bàn: Lưu dưới dạng chuỗi ngẫu nhiên trong DB, URL bàn sinh động dựa trên `FRONTEND_BASE_URL`.
* *(Thư mục tàn dư `app/modules/settings/service.py` có chứa code ghi file `.runtime/shop-settings.json` nhưng module này không được mount trong `app/main.py`).*

---

## 4. Kiểm tra phần Front-End (React + TypeScript + Vite)

### 4.1. Cấu trúc & Biến môi trường
* File `Front-End/package.json`: Khai báo đầy đủ React 18, React Router DOM 6, React Query, Axios, Lucide React, Tailwind CSS, TypeScript 5, Vite 5.
* Biến môi trường: `src/services/api.ts` đọc:
  `baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"`
* Cơ chế lưu JWT:
  * Lưu trữ trong `sessionStorage` với khóa `cafe458_token` và `cafe458_user`.
  * Axios Interceptor tự động đính kèm `Authorization: Bearer <token>` vào request. Khi nhận lỗi 401 trên các API admin, hệ thống tự xóa token và chuyển hướng về `/login`.
* Cơ chế Polling đơn mới:
  * `AdminLayout.tsx` kích hoạt `setInterval(checkNotifications, 5000)` gọi `/api/v1/admin/notifications/unread-orders` mỗi 5 giây, phát âm thanh cảnh báo và kích hoạt custom event `admin_new_order`.

### 4.2. Kết quả Build thử nghiệm
* Lệnh chạy: `npm run build` (`tsc && vite build`)
* **Kết quả: BUILD THÀNH CÔNG (Exit code 0)**.
  ```text
  ✓ 134 modules transformed.
  dist/index.html                   0.47 kB │ gzip:  0.31 kB
  dist/assets/index-Btm3EGE4.css   26.32 kB │ gzip:  5.74 kB
  dist/assets/index-Cd3r8NHG.js   326.47 kB │ gzip: 95.88 kB
  ✓ built in 2.07s
  ```
  => Không có lỗi TypeScript hay bundling nào chặn tiến trình release.

### 4.3. Kiểm tra SPA Fallback Rewrite (`/* -> /index.html`)
* **Chưa có cấu hình SPA Fallback Rewrite**: Hiện tại chưa có file `vercel.json`, `_redirects` (Netlify), hay template `nginx.conf`.
* **Rủi ro khi Deploy:** Do ứng dụng dùng `BrowserRouter` với các route sâu (`/menu?qr=...`, `/login`, `/admin/orders`, `/admin/tables`, `/admin/revenue`...), khi người dùng refresh (F5) hoặc nhập trực tiếp URL, static hosting sẽ trả về lỗi **HTTP 404 Not Found** nếu thiếu rewrite rule về `/index.html`.

---

## 5. Kết quả chạy kiểm thử tự động (Automated Testing)

### 5.1. Front-End (`vitest run`)
* **Kết quả: PASS 100%**
* **Số lượng:** 5/5 Test Files passed, 11/11 Tests passed (0 failed).
* **Thời gian thực thi:** 2.28s.
* **Chi tiết:** Đã bao phủ các bài test quan trọng: `extractApiError`, `LoginPage`, `PaymentTransfer`, `OrderDetailPage`, `TableDetailPage`.

### 5.2. Back-End (`pytest`)
* **Kết quả:** **26 PASSED, 1 FAILED** (trên tổng số 27 bài test).
* **Bài test thất bại:**
  * `tests/test_sales.py::test_report_details_and_tied_best_seller` (lỗi `assert 0 >= 10`).
* **Phân tích nguyên nhân kỹ thuật:**
  * Lệch múi giờ giữa dữ liệu test fixture và logic lọc của API:
    * Test fixture tạo ngày kiểm thử bằng `datetime.now(UTC).strftime("%Y-%m-%d")` (tại thời điểm chạy là ngày 12/11/2026 theo giờ UTC).
    * API gom nhóm doanh thu theo múi giờ Việt Nam `Asia/Ho_Chi_Minh` (tại thời điểm chạy ở Việt Nam đã là ngày 13/11/2026).
    * Khi test gửi query `date=2026-11-12`, API lọc dữ liệu theo ngày 12/11 giờ Việt Nam, trong khi các bản ghi vừa tạo trong fixture thuộc ngày 13/11 giờ Việt Nam, dẫn đến `tong_so_ly: 0`.

---

## 6. Đề xuất phương án Deploy từng phần

| Thành phần | Nền tảng đề xuất | Lý do & Yêu cầu cấu hình triển khai |
| :--- | :--- | :--- |
| **(a) Database & Storage** | **Supabase (Managed PostgreSQL & Object Storage)** | • **Cơ sở dữ liệu:** PostgreSQL 15+ tích hợp sẵn Row Level Security (RLS).<br>• **Storage:** Tạo bucket công khai `menu-images` để lưu trữ ảnh món ăn.<br>• **Kết nối:** Dùng chuỗi kết nối **Session Pooler (cổng 5432)** hoặc **Direct Connection (cổng 5432)**. Cần chạy migration `alembic upgrade head` và script `python scripts/seed_owner.py` ở bước khởi tạo ban đầu. |
| **(b) Back-End API** | **Render / Railway / Koyeb** *(PaaS hỗ trợ Python)* | • **Đặc tính:** Back-End hoàn toàn stateless, kiến trúc async FastAPI + Uvicorn.<br>• **Khuyến nghị Build:** Do chưa có `requirements.txt`, cần xuất file bằng `uv pip compile pyproject.toml -o Back-End/requirements.txt` hoặc dựng `Dockerfile` (Python 3.12-slim).<br>• **Lệnh Start Command:**<br>`uvicorn app.main:app --host 0.0.0.0 --port $PORT`<br>• **Biến môi trường bắt buộc:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_BASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BANK_BIN`, `BANK_ACCOUNT_NO`, `BANK_ACCOUNT_NAME`. |
| **(c) Front-End Web** | **Vercel / Cloudflare Pages / Netlify** *(Static Web Hosting)* | • **Đặc tính:** Ứng dụng tĩnh được biên dịch ra `Front-End/dist/` cực nhẹ, phân phối qua mạng CDN toàn cầu.<br>• **Root Directory:** Thư mục `Front-End`.<br>• **Build Command:** `npm run build`<br>• **Output Directory:** `dist`<br>• **Biến môi trường:** `VITE_API_BASE_URL=https://<domain-backend>/api/v1`<br>• **Cấu hình SPA Rewrite bắt buộc bổ sung:**<br>  - Vercel: Tạo file `Front-End/vercel.json` chứa `{"rewrites": [{"source": "/(.*)", "destination": "/"}]}`<br>  - Netlify: Tạo file `Front-End/public/_redirects` chứa `/*    /index.html   200` |

---

## 7. Danh sách việc cần làm trước khi bấm nút Release (Action Checklist)

1. [ ] **Thêm file cấu hình SPA Rewrite** (`Front-End/vercel.json` hoặc `Front-End/public/_redirects`) để ngăn chặn lỗi 404 khi truy cập trực tiếp route sâu hoặc khi F5 tải lại trang.
2. [ ] **Xuất file `requirements.txt` hoặc tạo `Dockerfile`** cho Back-End để các nền tảng PaaS (Render/Railway) tự động nhận diện và build dễ dàng mà không bị phụ thuộc vào môi trường quản lý gói `uv`.
3. [ ] **Cập nhật `.gitignore`**: Bỏ chặn thư mục `tests/` và `__tests__/` nếu muốn thiết lập quy trình kiểm thử tự động trên GitHub Actions CI/CD.
4. [ ] **Chỉnh sửa test fixture ngày trong `test_sales.py`**: Sử dụng múi giờ `Asia/Ho_Chi_Minh` khi sinh `today_str` thay vì UTC để tránh lỗi lệch ngày khi chạy bài test vào khung giờ 00:00 - 07:00 sáng.
5. [ ] **Cấu hình biến môi trường Production**: Khởi tạo tài khoản Supabase (Database + Bucket `menu-images`), điền thông tin ngân hàng VietQR và chuỗi bí mật `JWT_SECRET` production.
