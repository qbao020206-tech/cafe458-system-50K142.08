# 00_overview — Bản đồ tài liệu, tech stack và quy ước (Gem Cà phê 458)

> File này KHÔNG thay thế tài liệu gốc. Nội dung nghiệp vụ, use case, business rule, thông báo, màn hình, CSDL phải đọc trực tiếp từ tài liệu gốc trong Tri thức. File này chỉ cho biết đọc ở đâu và nhóm đã chốt công nghệ gì.

## 1. Bản đồ tài liệu (thứ tự ưu tiên khi có mâu thuẫn: 1 → 5)

| # | Tài liệu trong Tri thức | Chứa gì | Dùng cho |
|---|---|---|---|
| 1 | YÊU CẦU CHỨC NĂNG + PHI CHỨC NĂNG (docx) | UC_1…UC_8 (main/alternative/exception flow), business rule dạng BR-UCx-yy (bảng chung) và BRnn (trong từng UC), thông báo nguyên văn, NFR-01…06 | Hành vi hệ thống: chuẩn tham chiếu số 1 |
| 2 | SƠ ĐỒ LỚP + THIẾT KẾ CSDL (docx) | Sơ đồ lớp, 5 bảng, kiểu dữ liệu, ràng buộc, ước lượng dung lượng | Dữ liệu |
| 3 | THIẾT KẾ MÀN HÌNH (docx) | Sơ đồ luồng màn hình, danh sách màn hình U1–U16, danh sách UC, bảng ánh xạ UC ↔ màn hình | Ánh xạ UC ↔ màn hình |
| 4 | Đặc tả giao diện, file 04_dac_ta_giao_dien_gop.md (8 tài liệu gộp thành 1 tệp, chép nguyên văn: khách hàng, đăng nhập + trang chủ, đổi mật khẩu, quản lý gọi món, quản lý menu, quản lý bàn, quản lý doanh thu, đăng xuất) | Bảng thành phần từng màn hình/trạng thái (Bảng 37–131): nhãn, nút, thông báo, màu, trạng thái | Cổng đối chiếu Figma ↔ đặc tả |
| 5 | MÔ TẢ TỔNG QUAN VỀ ĐỀ TÀI (docx) | Bối cảnh, phạm vi, ngoài phạm vi, ràng buộc thiết kế, BR-01…07 (yêu cầu nghiệp vụ), yêu cầu các bên liên quan, hình BPMN và Use Case tổng quát | Bối cảnh, phạm vi |
| – | 01_bpmn.md | Mô tả văn bản của BPMN TO-BE (nhánh P1–P7 do nhóm đặt để trích dẫn) | Đối chiếu BPMN ↔ UC |
| – | 03_data_model.md | Bản dịch PostgreSQL (DDL v1), truy vấn doanh thu, mẫu SQLAlchemy 2.0 async | Dev Back-End |
| – | 05_quyet_dinh_va_audit.md | Quyết định kỹ thuật QĐ-xx, vấn đề tài liệu AUD-xx, câu hỏi còn mở | Mọi vai trò |

Cách trích dẫn: [tên tài liệu › mục/Bảng/ID], ví dụ [YÊU CẦU CHỨC NĂNG › UC_3.2/BR02], [Đặc tả giao diện › Bảng 94]. Mã BR trong từng UC (BR01…) khác mã BR-UCx-yy ở bảng chung; ánh xạ hai loại này ở 05_quyet_dinh_va_audit.md mục D.

## 2. Tóm tắt dự án (chi tiết ở tài liệu số 5)

- Quán Cà phê 458, 1 cơ sở, ~20 bàn, ~50 món, mở 5:00–17:00. Khách quét QR riêng của bàn để xem menu, đặt món, chọn tiền mặt hoặc chuyển khoản (mã QR ngân hàng kèm số tiền). Chủ quán (1 tài khoản duy nhất, không phân quyền) quản lý đơn, menu, bàn, doanh thu.
- Actor: Chủ quán (đăng nhập), Khách hàng (không tài khoản).
- 19 use case: UC_1, UC_2.1–2.3, UC_3.1–3.4, UC_4.1–4.4, UC_5.1–5.3, UC_6, UC_7.1–7.2, UC_8.
- Không tự xác minh giao dịch chuyển khoản; không kết nối ngân hàng; không thông báo ngoài hệ thống; chỉ web (xem "Ngoài phạm vi").

## 3. Tech stack (nhóm đã chốt)

| Hạng mục | Quyết định |
|---|---|
| Back-End | Python + FastAPI (Pydantic) |
| Front-End | HTML/CSS/JavaScript, React + TypeScript |
| Cơ sở dữ liệu | PostgreSQL trên Supabase, kết nối trực tiếp (Direct Connection, cổng 5432); mô hình quan hệ, khóa chính/khóa ngoại, xóa mềm trên 5 bảng |
| Tầng truy cập dữ liệu | SQLAlchemy 2.0 (async/await) + driver asyncpg; `AsyncSession` + `async_sessionmaker` quản lý phiên, connection pooling và transaction đa bảng (ví dụ tạo đơn) |
| Giao diện | Thiết kế trên Figma: https://www.figma.com/design/xXIO5KMxSpQYFJEQJRJi7f/50K142.08.3007?node-id=7-2&p=f&m=draw |

Các hạng mục kỹ thuật còn lại (xác thực, migration, thông báo đơn mới, lưu hình, thư viện UI, test, cấu hình ngân hàng, định dạng QR…) đã được chốt mặc định ở 05_quyet_dinh_va_audit.md mục B; nhóm có thể đổi, khi đổi thì sửa file 05.

## 4. Quy ước

- ID: UC_x / UC_x.y; business rule BR-UCx-yy (bảng chung) và BRnn (trong UC); NFR-xx; màn hình U1–U16 (theo tài liệu THIẾT KẾ MÀN HÌNH); nhánh BPMN P1–P7 (01_bpmn.md); AUD-xx (vấn đề tài liệu), QĐ-xx (quyết định kỹ thuật); API-xx, TC-xx, BUG-xx, R-xx cho sản phẩm nhóm tự tạo thêm.
- Python: PEP 8, `snake_case`. TypeScript: `camelCase`, component `PascalCase`. CSS class `kebab-case`. PostgreSQL: bảng/cột `snake_case`, ánh xạ từ tên camelCase của tài liệu (`tenDangNhap` → `ten_dang_nhap`, `DonHang` → `don_hang`).
- API: `/api/v1`, tài nguyên chữ thường số nhiều; một format lỗi JSON thống nhất (QĐ-21).
- Git: nhánh `feature/<ID>-<mô-tả-ngắn>` (ví dụ `feature/UC_3.2-them-mon`); mỗi PR có ít nhất 1 người khác review.

## 5. Definition of Done

- Đủ luồng chính, luồng thay thế, luồng ngoại lệ và business rule của use case liên quan.
- Thông báo, nhãn, tên trạng thái đúng nguyên văn tài liệu.
- Có test cho luồng chính và luồng lỗi; test pass; đã được thành viên khác review.
- Không còn BUG nghiêm trọng đang mở; tài liệu liên quan (đặc tả, API spec) đã cập nhật.

## 6. Thành viên và vai trò

| Thành viên | Vai trò | Phụ trách |
|---|---|---|
| [Tên] | BA | BPMN, đặc tả use case, business rule |
| [Tên] | Dev Back-End | Database, API |
| [Tên] | Dev Front-End | Giao diện theo Figma, gọi API |
| [Tên] | Tester | Test plan, test case, báo cáo lỗi |
| [Tên] | PM | Kế hoạch sprint, phân công, tiến độ |
