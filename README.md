# CÀ PHÊ 458 — QUY TẮC LÀM VIỆC VỚI GITHUB

Tài liệu này hướng dẫn cách làm việc chung trên GitHub cho nhóm dự án "Trang web hệ thống bán hàng quán Cà phê 458" [00_overview › mục 1]. Nhóm chỉ sử dụng duy nhất một nhánh **`main`** và phân chia ranh giới theo 3 thư mục độc lập [00_overview › mục 5].

---

## 1. Cấu Trúc Repository

```text
CaPhe458/                 <-- Thư mục gốc (Root) của dự án
├── Document/             <-- Chứa tài liệu (SRS, BPMN, Data Model, Figma, Test Cases)
├── Back-End/             <-- Mã nguồn Python + FastAPI [00_overview › mục 3]
├── Front-End/            <-- Mã nguồn React + TypeScript [00_overview › mục 3]
├── .gitignore            <-- Tệp chặn file rác/thư viện nặng (bắt buộc)
└── README.md             <-- Bản quy tắc này
```

### Phân công phạm vi (Ranh giới tuyệt đối):
- **Dev Back-End:** CHỈ thao tác, tạo, sửa tệp trong `Back-End/`.
- **Dev Front-End:** CHỈ thao tác, tạo, sửa tệp trong `Front-End/`.
- **BA / PM / Tester:** CHỈ thao tác trong `Document/`.
- **Nguyên tắc vàng:** Không đụng vào thư mục của nhóm khác để tránh bị ghi đè dữ liệu hoặc gây xung đột (conflict).

---

## 2. Xác Định Vị Trí Terminal Trước Khi Gõ Lệnh (Cực Kỳ Quan Trọng)

Đa số lỗi của người mới xuất phát từ việc **không biết Terminal đang đứng ở thư mục nào**. Trước khi gõ bất kỳ lệnh `git add` hay `git commit`, hãy nhìn kỹ dòng hiển thị đường dẫn trong Terminal/Command Prompt:

### Trường hợp 1: Bạn đang đứng tại thư mục GỐC (`CaPhe458>`)
Lúc này bạn nhìn thấy cả 3 thư mục con. Hãy dùng cú pháp:
```bash
# Nếu bạn làm Back-End:
git add Back-End/

# Nếu bạn làm Front-End:
git add Front-End/

# Nếu bạn làm Tài liệu:
git add Document/
```

### Trường hợp 2: Bạn đang đứng BÊN TRONG thư mục con (`CaPhe458/Back-End>`)
*(Thường gặp khi bạn gõ `cd Back-End` để chạy máy ảo Python)*
- **LƯU Ý:** Nếu đang ở trong `Back-End>`, gõ `git add Back-End/` sẽ báo lỗi `fatal: pathspec did not match any files`.
- **Cách gõ đúng khi đang ở trong thư mục con:**
  ```bash
  # Thêm toàn bộ các file trong thư mục hiện tại của mình:
  git add .
  ```
  *(Vì bạn đang ở trong `Back-End/`, `git add .` chỉ thêm các file của Back-End, hoàn toàn an toàn).*

---

## 3. Quy Trình 4 Bước Đẩy Code Chuẩn (Tránh Xung Đột)

Mọi thành viên thực hiện đúng thứ tự 4 bước sau mỗi khi bắt đầu và kết thúc ca làm việc:

```text
[BƯỚC 1: Pull]  --->  [BƯỚC 2: Check & Add]  --->  [BƯỚC 3: Commit]  --->  [BƯỚC 4: Pull & Push]
Lấy bài mới           Chỉ thêm thư mục mình        Ghi rõ nội dung       Đẩy bài an toàn
```

### Bước 1: Kéo code mới về máy trước khi bắt đầu code
Mỗi sáng hoặc trước khi ngồi vào làm, mở Terminal tại thư mục dự án và chạy:
```bash
git pull origin main
```
> *Lý do:* Để lấy toàn bộ cập nhật mới nhất mà bạn bè trong nhóm vừa đẩy lên.

### Bước 2: Kiểm tra trạng thái và chỉ thêm đúng thư mục của mình
Sau khi viết code hoặc sửa tài liệu xong:
```bash
# 1. Kiểm tra xem mình đã sửa những tệp nào (sẽ hiện chữ màu đỏ):
git status

# 2. Thêm đúng thư mục phụ trách (tại thư mục gốc):
git add Back-End/      # (Đối với dev BE)
# hoặc:
git add Front-End/     # (Đối với dev FE)
# hoặc:
git add Document/      # (Đối với tài liệu)

# 3. Kiểm tra lại: các file được chọn sẽ chuyển sang màu xanh lá cây:
git status
```

### Bước 3: Đặt thông điệp commit rõ ràng
Ghi chú nội dung đã làm theo định dạng: `[Nhóm] Tên công việc theo Use Case` [00_overview › mục 4]:
```bash
# Ví dụ Back-End:
git commit -m "[BE] Tao API xem menu va mon ban chay UC_7.1"

# Ví dụ Front-End:
git commit -m "[FE] Dung giao dien quan ly ban UC_4.1"

# Ví dụ Tài liệu:
git commit -m "[DOC] Cap nhat dac ta use case tao don UC_7.2"
```

### Bước 4: Đẩy code lên GitHub an toàn
Trước khi push, luôn pull lại một lần để bảo đảm không có ai vừa đẩy lên trước bạn trong lúc bạn đang commit:
```bash
git pull origin main
git push origin main
```

---

## 4. Xử Lý Tệp Cấu Hình (.env) và Tệp CẤM Tuyệt Đối

### 4.1. Đối với tệp `.env` (Biến môi trường)
Do repository của nhóm để ở chế độ **Private (Riêng tư)** nội bộ bài tập, nhóm thống nhất giữ lại cấu hình `.env` để khi thành viên clone về có thể chạy ngay không bị lỗi thiếu thông tin DB Supabase [00_overview › mục 3].
- Đảm bảo tệp `.env` chỉ chứa thông tin dự án môn học, **tuyệt đối không dùng mật khẩu hoặc tài khoản email cá nhân**.

### 4.2. Danh mục TUYỆT ĐỐI CẤM push lên Git
Trước khi commit, nếu thấy các thư mục sau hiện màu đỏ trong `git status`, **KHÔNG ĐƯỢC ADD**:
1. **Front-End:** `node_modules/`, `dist/`, `build/` (Dung lượng hàng trăm MB, làm đơ Git của cả nhóm).
2. **Back-End:** `venv/`, `.venv/`, `env/`, `__pycache__/`, `*.pyc` (Môi trường ảo và file rác Python).
3. **File máy cá nhân:** `.vscode/`, `.DS_Store`, `Thumbs.db`.

> **Cách khắc phục nhanh:** Đảm bảo tệp `.gitignore` ở thư mục gốc luôn có nội dung sau:
> ```gitignore
> # Dependencies & Cache
> Front-End/node_modules/
> Front-End/dist/
> Back-End/__pycache__/
> Back-End/.venv/
> Back-End/venv/
> .vscode/
> .DS_Store
> ```

---

## 5. Hướng Dẫn Cứu Nguy (Khi Lỡ Làm Sai)

### Tình huống 1: Lỡ gõ `git add .` nhầm cả thư mục người khác
Hủy chọn để làm lại mà không làm mất code:
```bash
git reset
```
Sau đó gõ lại lệnh add đúng thư mục của mình như hướng dẫn ở Bước 2.

### Tình huống 2: Bị báo lỗi `CONFLICT` khi gõ `git pull`
- **Nguyên nhân:** Hai bạn cùng sửa vào cùng một dòng của một file (ví dụ: cùng sửa file `README.md` hoặc cấu hình chung).
- **Cách xử lý:**
  1. Không hoảng loạn, không xóa repo.
  2. Mở Visual Studio Code lên, file bị lỗi sẽ hiển thị nhãn `! C` màu đỏ.
  3. Mở file đó ra, VS Code sẽ hiện các nút lựa chọn: *Accept Current Change* (Giữ bản của mình), *Accept Incoming Change* (Lấy bản của bạn vừa pull về), hoặc *Accept Both Changes* (Giữ cả hai).
  4. Hai người liên quan gọi điện trao đổi để chọn đúng dòng cần giữ, lưu file lại.
  5. Chạy lệnh:
     ```bash
     git add <ten-file-vua-sua>
     git commit -m "[FIX] Giai quyet xung dot code"
     git push origin main
     ```