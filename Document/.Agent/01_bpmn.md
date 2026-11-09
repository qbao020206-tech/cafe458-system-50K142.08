# 01_bpmn — Quy trình bán hàng quán Cà phê 458 (TO-BE)

> Mô tả bằng văn bản từ sơ đồ BPMN_Tobe (Hình 1 trong tài liệu MÔ TẢ TỔNG QUAN). Sơ đồ gốc là nguồn chính; nếu mô tả này khác sơ đồ hoặc khác tài liệu FINAL, theo tài liệu gốc và báo nhóm sửa.

## Cấu trúc sơ đồ

- Pool "Hệ thống bán hàng của quán Cà phê 458", có 2 lane: **Chủ quán** và **Khách hàng**. Bước do hệ thống tự thực hiện cũng được đặt trong lane của người đang thao tác.
- Pool ngoài: **Ngân hàng** (chỉ nhận "Lệnh chuyển khoản" từ khách hàng).
- Mã nhánh P1–P7 dưới đây do nhóm đặt để trích dẫn, không có trong sơ đồ gốc.

## P1 — Đăng nhập và thao tác quản trị (Chủ quán)

1. Bắt đầu: Truy cập hệ thống.
2. Đăng nhập hệ thống.
3. Hệ thống kiểm tra tài khoản.
4. Cổng "Tài khoản đúng?": Sai → Báo lỗi → quay lại bước 2. Đúng → bước 5.
5. Cổng "Cần cập nhật Menu, Bàn hay Đổi mật khẩu không?": Có → Thực hiện thao tác → Lưu cập nhật vào hệ thống. Không → bỏ qua.
6. Sau đó quy trình tách hai nhánh: vận hành phục vụ khách (bắt đầu từ P2) và xem doanh thu khi có nhu cầu (P7).

## P2 — Khách đặt món (Khách hàng)

1. Bắt đầu (sự kiện thông điệp): Khách vào quán.
2. Quét mã QR tại bàn.
3. Hệ thống hiển thị menu và Món bán chạy.
4. Chọn món và số lượng.
5. Hệ thống hiển thị tổng tiền.
6. Chọn phương thức thanh toán.
7. Cổng "Phương thức thanh toán?":
   - Tiền mặt → Hiển thị thông báo "Chờ thu tiền sau khi bưng nước ra".
   - Chuyển khoản → Hiển thị mã QR ngân hàng kèm số tiền của đơn, nội dung chuyển khoản gồm số bàn → Khách chuyển khoản trong ứng dụng ngân hàng (gửi "Lệnh chuyển khoản" tới pool Ngân hàng).
8. Nhấn "Hoàn tất".
9. Tạo đơn. Dữ liệu: số bàn, món + số lượng, thời gian, phương thức thanh toán.
10. Lưu đơn với trạng thái "Chưa xác nhận thanh toán".
11. Hiển thị "Đặt món thành công".
12. Chạy song song: chuyển trạng thái bàn sang "Đang phục vụ" và gửi thông báo cho chủ quán.

## P3 — Pha chế và giao nước

1. Chủ quán nhận thông báo.
2. Pha chế.
3. Mang nước ra bàn.
4. Khách nhận nước.
5. Cổng "Khách đổi món / nhầm món không?": Có → P4. Không → P5.

## P4 — Đổi món / nhầm món (xóa đơn)

1. Khách thông báo cho chủ quán.
2. Chủ quán chọn "Quản lý gọi món" → chọn "Xóa đơn".
3. Hệ thống đánh dấu đơn đã xóa và loại khỏi thống kê.
4. Cổng "Khách đã chuyển tiền chưa?": Rồi → Hoàn tiền cho khách. Chưa → bỏ qua.
5. Thông báo khách quét mã lại → khách quay lại P2 bước 2 để tạo đơn mới.

## P5 — Thanh toán

1. Kiểm tra phương thức thanh toán của đơn.
2. Cổng "Phương thức thanh toán?":
   - Tiền mặt → Khách đưa tiền → Chủ quán thối tiền.
   - Chuyển khoản → không có bước thu tiền tại bàn.
3. Chủ quán bấm nút xác nhận (đã nhận tiền).
4. Hệ thống chuyển đơn sang trạng thái "Đã xác nhận thanh toán".
5. Hệ thống tự cộng doanh thu và số ly.

## P6 — Kết thúc phục vụ

1. Khách uống nước.
2. Chờ (sự kiện thời gian).
3. Cổng "Gọi thêm món?": Có → quay lại P2 bước 2 (đơn mới, độc lập với đơn trước). Không → Khách rời quán.
4. Chủ quán dọn bàn.
5. Bấm xác nhận bàn trống.
6. Hệ thống chuyển trạng thái bàn về "Trống".
7. Kết thúc: Hoàn tất phục vụ.

## P7 — Xem doanh thu (Chủ quán)

1. Bắt đầu (sự kiện thông điệp): Khi chủ quán có nhu cầu xem doanh thu.
2. Chọn chức năng "Quản lý doanh thu".
3. Hệ thống tự thống kê doanh thu. Dữ liệu: tổng doanh thu, số ly, món bán chạy theo thời gian.
4. Xem doanh thu.
5. Kết thúc: Hoàn tất.

## Đối chiếu BPMN với use case

| Bước BPMN | Use case |
| --------- | -------- |
| P1.2–P1.4 Đăng nhập | UC_1 |
| P1.5 Cập nhật menu / bàn / đổi mật khẩu | UC_3.x, UC_4.x, UC_6 |
| P2.2–P2.3 Quét QR, xem menu | UC_7.1 |
| P2.4–P2.12 Chọn món, thanh toán, tạo đơn | UC_7.2 |
| P4.2–P4.3 Xóa đơn | UC_2.3 |
| P5.3–P5.5 Xác nhận đã nhận tiền | UC_2.1 |
| P6.5–P6.6 Xác nhận bàn trống | UC_4.4 |
| P7 Xem doanh thu và thống kê | UC_5.1, UC_5.2, UC_5.3 |
