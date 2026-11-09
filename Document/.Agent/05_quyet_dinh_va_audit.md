# 05_quyet_dinh_va_audit — Quyết định kỹ thuật, vấn đề tài liệu, câu hỏi mở

> Cập nhật 09/11/2026, sau khi nhóm nạp bộ tài liệu FINAL. Đối chiếu với tài liệu gốc trong Tri thức trước khi dùng; nếu tài liệu gốc khác file này thì tài liệu gốc đúng và file này cần sửa.
> Nhãn: **NHÓM CHỐT** = nhóm đã quyết định. **MẶC ĐỊNH** = Team Assistant chốt thay nhóm để Dev bắt đầu code; nhóm có quyền đổi, khi đổi phải sửa dòng tương ứng. **TẠM CHỐT** = giả định tạm vì tài liệu chưa nói, cần nhóm xác nhận.

## A. Mục đã được tài liệu FINAL giải quyết (không hỏi lại)

| Mục từng "chưa chốt" | Kết quả | Nguồn |
|---|---|---|
| Tên trạng thái đơn | Thống nhất "Chưa xác nhận thanh toán" / "Đã xác nhận thanh toán" ở mọi UC, BR, màn hình và CSDL | YÊU CẦU CHỨC NĂNG (UC_2.x, UC_5.x, UC_7.2); SƠ ĐỒ LỚP + CSDL (Bảng 32) |
| Cột `daXoa` | Đã có ở Ban, Mon, DonHang (Bit, DEFAULT 0) | CSDL Bảng 32 |
| Bảng mã trạng thái số | Không còn: trạng thái lưu dạng chuỗi nguyên văn (Nvarchar) | CSDL Bảng 32 |
| `hinhAnh` quá ngắn | Đã là Varchar(255), NULL = dùng hình mặc định | CSDL Bảng 32 |
| Khóa chính ChuQuan | `tenDangNhap` là PK | CSDL Bảng 32 |
| Đơn lưu snapshot món | ChiTietDon có `tenMon`, `gia` | CSDL Bảng 32; BR-UC3-08, BR-UC3-10 |
| Ghi chú đơn | `ghiChu` Nvarchar(200) NULL | CSDL Bảng 32; BR-UC7-08 |
| Công nghệ DB/ORM | PostgreSQL + Supabase Direct 5432; SQLAlchemy 2.0 async + asyncpg + AsyncSession/async_sessionmaker (không dùng supabase-py) | NHÓM CHỐT (00_overview mục 3) |
| Thông báo đơn mới | Chỉ trong hệ thống (biểu tượng chuông trên màn hình chủ quán), không âm thanh/Zalo/SMS/email | MÔ TẢ TỔNG QUAN (Ngoài phạm vi); Đặc tả giao diện (chuông "Báo khi có đơn mới") |

## B. Quyết định kỹ thuật (QĐ)

| QĐ | Nội dung | Nhãn | Lý do ngắn |
|---|---|---|---|
| QĐ-01 | Xác thực tự làm: bảng `chu_quan`, mật khẩu băm bcrypt, FastAPI cấp JWT (HS256, hết hạn 12 giờ, không refresh token). Bí mật JWT trong biến môi trường. FE giữ token trong `sessionStorage`. Không dùng Supabase Auth. | MẶC ĐỊNH | Bám đúng bảng `ChuQuan` và UC_1/UC_6; Supabase Auth tách khỏi bảng gốc |
| QĐ-03 | Migration bằng Alembic (template async). | MẶC ĐỊNH | Chuẩn cho SQLAlchemy |
| QĐ-04 | Direct Connection 5432 theo nhóm. Nếu máy dev/nơi deploy chỉ có IPv4 thì đổi `DATABASE_URL` sang Session Pooler (cổng 5432, host pooler), code giữ nguyên. Không dùng Transaction Pooler 6543. | NHÓM CHỐT + MẶC ĐỊNH cho dự phòng | Direct chạy IPv6 trừ khi có add-on IPv4 |
| QĐ-05 | Thông báo đơn mới: FE polling API mỗi 5 giây (đếm/ lấy đơn mới sau `ma_don_hang` đã biết), hiện số trên chuông và toast. Không dùng Supabase Realtime, không phát âm thanh (tài liệu FINAL không yêu cầu). | MẶC ĐỊNH | Đơn giản, ~60 đơn/ngày, đúng "thông báo trong hệ thống" |
| QĐ-06 | Hình món: Supabase Storage, bucket public `menu-images`; chỉ Back-End upload (giữ khóa phía server); `mon.hinh_anh` lưu đường dẫn đối tượng, API trả URL đầy đủ; chấp nhận jpg/png/webp ≤ 2 MB; NULL → FE dùng hình mặc định. | MẶC ĐỊNH | BR-UC3-05, NFR-05 |
| QĐ-07 | Front-End: Vite + React + TypeScript, React Router, TanStack Query (polling), Tailwind CSS. Màu chủ đạo đỏ, phụ xanh lá (NFR-03); bàn Trống = xanh dương, Đang phục vụ = vàng (NFR-04); đơn Chưa xác nhận = vàng, Đã xác nhận = xanh (Đặc tả giao diện Bảng 55). Giao diện bám Figma, ưu tiên mobile. | MẶC ĐỊNH | |
| QĐ-08 | Test: BE `pytest` + `pytest-asyncio` + `httpx.AsyncClient`; FE Vitest + React Testing Library. Test chạy trên CSDL riêng (Postgres local/Docker hoặc project Supabase test), không chạy trên dữ liệu thật. | MẶC ĐỊNH | |
| QĐ-09 | DDL v1 ở 03_data_model.md mục 1 là bản chuẩn để viết migration (đã thêm NOT NULL cho FK, CHECK giá trị trạng thái, CHECK `gia > 0`, ràng buộc `thoi_gian_giao_dich`, unique index một phần). | MẶC ĐỊNH, chờ nhóm duyệt | Thực thi BR-UC3-03, BR-UC4-04 |
| QĐ-10 | Tên bảng/cột PostgreSQL dùng snake_case. | MẶC ĐỊNH | |
| QĐ-11 | Trạng thái và phương thức thanh toán lưu và trả qua API bằng chuỗi tiếng Việt nguyên văn của tài liệu, kèm CHECK ở CSDL. Không dùng mã số. | MẶC ĐỊNH | Khớp thiết kế gốc |
| QĐ-12 | Thông tin tài khoản nhận tiền (ngân hàng, STK, tên chủ TK) đặt trong biến môi trường BE (`BANK_BIN`, `BANK_NAME`, `BANK_ACCOUNT_NO`, `BANK_ACCOUNT_NAME`), không tạo bảng cấu hình (không có UC sửa). Mã QR chuyển khoản sinh theo chuẩn VietQR (EMVCo) từ thông tin đó + số tiền đơn do Back-End tính; nội dung chuyển khoản: `BAN <so_ban>` không dấu (ví dụ `BAN 03`). Phương án nhanh thay thế: ảnh QR từ `img.vietqr.io` (chỉ dựng URL ảnh, không kết nối ngân hàng). | MẶC ĐỊNH | Màn hình U3 cần hiện tên NH, STK, chủ TK, nội dung = số bàn |
| QĐ-13 | `ban.ma_qr` lưu token ngẫu nhiên 16 ký tự (`secrets.token_urlsafe(12)`), UNIQUE. Nội dung mã QR in ở bàn = `{FRONTEND_BASE_URL}/menu?qr={ma_qr}`; ảnh QR (PNG) do Back-End sinh khi thêm bàn và khi bấm "Tải mã QR". Không đưa số bàn vào URL để khách không đoán được QR bàn khác. Bàn bị xóa mềm → "Mã QR không hợp lệ". | MẶC ĐỊNH | BR-UC4-05, BR-UC7-02 |
| QĐ-14 | Doanh thu và số ly tính theo `thoi_gian_giao_dich` (lúc chủ quán xác nhận đã nhận tiền); danh sách đơn theo ngày (UC_2.2) tính theo `thoi_gian_dat`. Múi giờ Asia/Ho_Chi_Minh; ngày = [00:00, 24:00). Cột thời gian dùng TIMESTAMPTZ. | MẶC ĐỊNH | UC_2.1 ghi nhận thời gian giao dịch khi xác nhận; quán đóng 17:00 nên lệch ngày gần như không xảy ra |
| QĐ-15 | Không có chức năng đăng ký. Tài khoản chủ quán tạo bằng script seed đọc `OWNER_USERNAME`/`OWNER_PASSWORD` từ môi trường, băm bcrypt. | MẶC ĐỊNH | UC_1 tiền điều kiện "đã có tài khoản" |
| QĐ-16 | Bật RLS cho cả 5 bảng, không tạo policy (chặn truy cập qua Supabase Data API); BE dùng role `postgres`. Không đưa DB password, `service_role` key, JWT secret vào FE hoặc Git; `.env` nằm trong `.gitignore`. | MẶC ĐỊNH | |
| QĐ-17 | Mã đơn hiển thị: `#` + `ma_don_hang` đệm số 0 đến 4 chữ số (ví dụ `#0101`); lưu số nguyên. | MẶC ĐỊNH | Đặc tả giao diện Bảng 64 hiện "#0101" |
| QĐ-18 | "Món đề cử" (UC_7.1): tối đa 3 món bán nhiều nhất trong 30 ngày gần nhất, tính từ đơn Đã xác nhận thanh toán chưa xóa, chỉ món đang Hiển thị chưa xóa, gắn nhãn thứ hạng 1–3; chưa có dữ liệu thì ẩn khu vực. | TẠM CHỐT | Bản đặc tả cũ có quy tắc này, bản FINAL bỏ mất (xem AUD-03) |
| QĐ-19 | Thứ tự danh sách món cho chủ quán: món mới thêm nằm đầu (`ma_mon` giảm dần). Menu khách: theo `ma_mon` tăng dần (phần "Món đề cử" ở trên). | TẠM CHỐT | Đặc tả giao diện Bảng 76 chỉ nói món mới nằm đầu |
| QĐ-20 | Chuẩn hóa đầu vào: cắt khoảng trắng đầu/cuối; tên món duy nhất không phân biệt hoa/thường; số bàn so khớp nguyên chuỗi (`3` khác `03`). | MẶC ĐỊNH | BR-UC3-03, BR-UC4-04 |
| QĐ-21 | Lỗi API một format: `{"error": {"code": "...", "message": "<thông báo nguyên văn trong tài liệu>", "field": "<tên trường hoặc null>"}}`; không lộ stack trace. Token hết hạn/không hợp lệ → 401, FE chuyển về màn hình Đăng nhập. | MẶC ĐỊNH | Tài liệu chưa nói về hết phiên |
| QĐ-22 | Back-End tự tính tổng tiền và lấy giá từ CSDL; không tin giá/tổng tiền từ client. Món ẩn, đã xóa hoặc không tồn tại trong đơn → từ chối với "Đặt món không thành công, vui lòng thử lại!". | MẶC ĐỊNH | BR-UC7-03 |
| QĐ-23 | Định dạng hiển thị: ngày `dd/MM/yyyy`, giờ `HH:mm`, tiền `27.000đ`. | MẶC ĐỊNH | Theo ví dụ trong Đặc tả giao diện |
| QĐ-24 | Số đơn chưa xác nhận trên thẻ "Đơn hàng" ở Trang chủ = số đơn "Chưa xác nhận thanh toán", chưa xóa, mọi ngày. | TẠM CHỐT | Đặc tả giao diện Bảng 54 chưa nói phạm vi |
| QĐ-25 | Màn hình Thanh toán: giảm số lượng về 0 thì bỏ món khỏi đơn; hết món thì báo "Vui lòng chọn ít nhất một món" và quay về Menu. | TẠM CHỐT | Tài liệu chưa nói |

## C. Vấn đề trong tài liệu FINAL (AUD)

Mức: **Cao** = lệch/thiếu ảnh hưởng hành vi hoặc giao diện; **Thấp** = chỉnh câu chữ/số hiệu. Chưa có lỗi "Chặn code" sau khi áp dụng mục B.

| ID | Mức | Vị trí | Mô tả | Đề xuất sửa (bên sửa) |
|---|---|---|---|---|
| AUD-01 | Cao | Đặc tả giao diện, Bảng 108 (Thông tin bàn đang phục vụ) ↔ BR-UC4-08, BR-UC4-09 | Bàn "Đang phục vụ" có nút "Xóa bàn", nhưng BR nói nút chỉ hiện và chỉ xóa được khi bàn "Trống" | Bỏ nút "Xóa bàn" ở Bảng 108 và ở Figma (Figma + đặc tả giao diện). FE làm theo BR |
| AUD-02 | Cao | UC_6 ngoại lệ 5c ↔ Đặc tả giao diện đổi mật khẩu (Bảng 119–127) | Có thông báo "Mật khẩu mới và mật khẩu nhập lại không giống nhau!" nhưng không có màn hình/trạng thái tương ứng | Thêm trạng thái "Đổi mật khẩu – Nhập lại không khớp" vào Figma và đặc tả giao diện |
| AUD-03 | Cao | UC_7.1 bước 3, Đặc tả giao diện Bảng 37 (Món đề cử, nhãn thứ hạng) | Có khu vực "Món đề cử" nhưng không có business rule nào quy định số món, kỳ tính, nguồn dữ liệu (bản đặc tả cũ có "tối đa 3 món, 30 ngày gần nhất", bản FINAL không còn) | Thêm BR vào UC_7.1 (đề xuất QĐ-18) |
| AUD-04 | Thấp | MÔ TẢ TỔNG QUAN, "Phạm vi tích hợp" ↔ "Ràng buộc chung" và "Ngoài phạm vi" | Một chỗ nói "sẽ kết nối với hệ thống ngân hàng", chỗ khác nói "không kết nối ngân hàng" | Sửa "Phạm vi tích hợp": chỉ tạo mã QR chuyển khoản (VietQR) từ thông tin tài khoản và số tiền, không kết nối ngân hàng |
| AUD-05 | Thấp | YÊU CẦU PHI CHỨC NĂNG, Bảng 30 và 31 | Cùng dùng ID NFR-01 cho yêu cầu khả năng sử dụng và hiệu năng | Đổi hiệu năng thành NFR-07 |
| AUD-06 | Thấp | YÊU CẦU CHỨC NĂNG, bảng BR chung ↔ BR trong từng UC | Hai kiểu đánh số (BR-UCx-yy và BRnn) lệch nhau ở UC_2, UC_3, UC_4, UC_5, UC_7 (mục D); UC_3.2/BR06 ("Món mới thêm mặc định Hiển thị") không có trong bảng chung; BR-UC3-06 và BR-UC3-11 trùng ý | Thêm BR còn thiếu vào bảng chung, gộp 06/11; dùng mục D khi trích dẫn |
| AUD-07 | Thấp | Sơ đồ lớp ↔ CSDL | `DonHang.maDon: String` (lớp) ↔ `maDonHang Int` (CSDL); lớp `ChiTietDon` không có `maMon` dù CSDL có; `Ban.maBan` không ghi kiểu | Sửa sơ đồ lớp cho khớp CSDL |
| AUD-08 | Thấp | MÔ TẢ TỔNG QUAN, Hình 2 (Use Case tổng quát) | "Quản lý gọi món" `<<include>>` "Đặt món" (Đặt món là của khách, không thuộc quản lý gọi món); "Đổi mật khẩu" và "Đăng xuất" dùng `<<extend>>` tới "Đăng nhập" (ngữ nghĩa là phụ thuộc đăng nhập) | Sửa quan hệ trong sơ đồ |
| AUD-09 | Thấp | THIẾT KẾ MÀN HÌNH, Hình 30 ↔ danh sách U1–U16 | Sơ đồ luồng có "Xác nhận đã nhận tiền", "Xóa đơn", "Xóa món", "Xóa bàn", "Xác nhận bàn trống", "Đăng xuất", "Đặt món thành công/không thành công" như màn hình riêng nhưng không có mã U | Ghi chú: các mục này là hộp thoại/trạng thái của màn hình cha, hoặc cấp mã U17+ |
| AUD-10 | Thấp | UC_4.2 ↔ Đặc tả giao diện Bảng 99 | UC kết thúc sau "Tải mã QR"; màn hình ghi "Tải xong quay về sơ đồ bàn" | Thống nhất một cách mô tả |
| AUD-11 | Thấp | UC_5.2, UC_5.3 ↔ CSDL | Tài liệu không nói doanh thu tính theo thời điểm nào (đặt hay xác nhận) | Chốt như QĐ-14 và ghi vào BR-UC5 |
| AUD-12 | Thấp | UC_3.4 (đổi tên món) ↔ UC_5.3 | Đổi tên món: đơn cũ giữ tên cũ (BR-UC3-08), nên thống kê UC_5.3 gom theo mã món và lấy tên của đơn gần nhất | Ghi chú vào UC_5.3 |

## D. Ánh xạ BR trong từng UC ↔ BR-UCx-yy (bảng chung)

| UC | BR cục bộ → BR chung |
|---|---|
| UC_1 | BR01 → UC1-01 |
| UC_2.1 | BR01–03 → UC2-01…03 |
| UC_2.2 | BR01–03 → UC2-04…06 |
| UC_2.3 | BR01–03 → UC2-07…09 |
| UC_3.1 | BR01 → UC3-01 |
| UC_3.2 | BR01–05 → UC3-02…06; BR06 → (không có) |
| UC_3.3 | BR01–03 → UC3-07…09 |
| UC_3.4 | BR01–03 → UC3-02…04; BR04 → UC3-10; BR05 → UC3-11; BR06 → UC3-12 |
| UC_4.1 | BR01–02 → UC4-01…02 |
| UC_4.2 | BR01–05 → UC4-03…07 |
| UC_4.3 | BR01–03 → UC4-08…10 |
| UC_4.4 | BR01 → UC4-11 |
| UC_5.1 | BR01–05 → UC5-01…05 |
| UC_5.2 | BR01 → UC5-01; BR02 → UC5-06; BR03 → UC5-07 |
| UC_5.3 | BR01 → UC5-01; BR02 → UC5-08; BR03 → UC5-09; BR04 → UC5-07; BR05 → UC5-10 |
| UC_6 | BR01–03 → UC6-01…03 |
| UC_7.1 | BR01 → UC7-01 |
| UC_7.2 | BR01–08 → UC7-02…09 |
| UC_8 | không có |

## E. Còn cần nhóm xác nhận

1. Duyệt DDL v1 (QĐ-09) trước khi viết migration.
2. Xác nhận ba mục TẠM CHỐT: Món đề cử (QĐ-18), thứ tự danh sách món (QĐ-19), phạm vi số đơn chưa xác nhận (QĐ-24), cùng QĐ-25.
3. Sửa tài liệu/Figma theo AUD-01, AUD-02, AUD-03 (ba mục ảnh hưởng giao diện và hành vi).
4. Cung cấp thông tin tài khoản ngân hàng thật (ngân hàng, STK, tên chủ TK) cho biến môi trường QĐ-12.
