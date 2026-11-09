# 04_dac_ta_giao_dien_gop — Đặc tả giao diện (8 tài liệu gộp, chép nguyên văn)

> File này được tạo cơ học từ 8 tài liệu "ĐẶC TẢ MÀN HÌNH" của nhóm (khách hàng, đăng nhập + trang chủ, quản lý gọi món, quản lý menu, quản lý bàn, quản lý doanh thu, đổi mật khẩu, đăng xuất), sắp theo thứ tự Bảng 37 → 131 để gộp thành 1 tệp vì Gem chỉ nhận tối đa 10 tệp. Không sửa nội dung. Bảng được giữ nguyên; hình minh họa (Hình 31–125) không có trong file này, xem Figma hoặc tài liệu docx gốc. Danh sách màn hình U1–U16 và bảng ánh xạ UC ↔ màn hình nằm ở tài liệu THIẾT KẾ MÀN HÌNH.


### Đặc tả giao diện khách hàng

#### Màn hình Menu (UC 7.1)
Hình 31. Màn hình Menu (UC 7.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Tiêu đề “Menu” |  |
| 2 | Text | Số bàn khách đang ngồi | Lấy theo mã QR khách đã quét |
| 3 | Text | Tiêu đề “Món đề cử” |  |
| 4 | Text | Nhãn thứ hạng của món đề cử |  |
| 5 | Image | Hình ảnh của món đề cử | Món không có hình thì dùng hình mặc định |
| 6 | Text | Tên món đề cử |  |
| 7 | Text | Giá bán của món đề cử |  |
| 8 | Text | Tiêu đề “Tất cả món” |  |
| 9 | Image | Hình ảnh của món | Món không có hình thì dùng hình mặc định |
| 10 | Text | Tên món |  |
| 11 | Text | Giá bán của món |  |
| 12 | Button | Nút “+”, nhấn để thêm món vào đơn | Mỗi lần nhấn tăng số lượng lên 1 |
Bảng 37. Mô tả màn hình Menu (UC 7.1)

#### Màn hình Menu – Chưa có món (UC 7.1)
Hình 32. Màn hình Menu – Chưa có món (UC 7.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Tiêu đề “Menu” |  |
| 2 | Text | Số bàn khách đang ngồi: “Bàn 03” |  |
| 3 | Icon | Icon ly cà phê |  |
| 4 | Text | Thông báo “Menu chưa có món nào” | Hiện khi quán chưa có món nào đang hiển thị |
Bảng 38. Mô tả màn hình Menu – Chưa có món (UC 7.1)

#### Màn hình Menu – Lỗi tải dữ liệu (UC 7.1)
Hình 33. Màn hình Menu – Lỗi tải dữ liệu (UC 7.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi hệ thống không tải được menu |
Bảng 39. Mô tả màn hình Menu – Lỗi tải dữ liệu (UC 7.1)

#### Màn hình Menu – Mã QR không hợp lệ (UC 7.1)
Hình 34. Màn hình Menu – Mã QR không hợp lệ (UC 7.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Mã QR không hợp lệ” | Hiện khi mã QR sai hoặc bàn đã bị xóa |
Bảng 40. Mô tả màn hình Menu – Mã QR không hợp lệ (UC 7.1)

#### Màn hình Menu – Đã chọn món (UC 7.2)
Hình 35. Màn hình Menu – Đã chọn món (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “−”, nhấn để giảm số lượng món |  |
| 2 | Text | Số lượng đã chọn của món |  |
| 3 | Text | Tổng số món đã chọn |  |
| 4 | Text | Tổng tiền của đơn | Tổng tiền = giá × số lượng của các món cộng lại |
| 5 | Button | Nút “Tiếp tục”, nhấn để chuyển sang màn hình Thanh toán |  |
Bảng 41. Mô tả màn hình Menu – Đã chọn món (UC 7.2)

#### Màn hình Menu – Chưa chọn món (UC 7.2)
Hình 36. Màn hình Menu – Chưa chọn món (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Vui lòng chọn ít nhất một món” | Hiện khi nhấn “Tiếp tục” mà chưa chọn món |
Bảng 42. Mô tả màn hình Menu – Chưa chọn món (UC 7.2)

#### Màn hình Thanh toán – Đơn của bạn (UC 7.2)
Hình 37. Màn hình Thanh toán – Đơn của bạn (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon quay lại, nhấn để trở về màn hình Menu |  |
| 2 | Text | Tiêu đề “Thanh toán” |  |
| 3 | Text | Tiêu đề “Đơn của bạn” |  |
| 4 | Text | Tên món đã chọn |  |
| 5 | Text | Đơn giá của món |  |
| 6 | Button | Nút “−”, nhấn để giảm số lượng món |  |
| 7 | Text | Số lượng của món |  |
| 8 | Button | Nút “+”, nhấn để tăng số lượng món |  |
| 9 | Text | Nhãn “Ghi chú (không bắt buộc)” |  |
| 10 | Input Text | Ô nhập ghi chú cho cả đơn | Không bắt buộc, tối đa 200 ký tự |
| 11 | Text | Chữ gợi ý (placeholder) “Ví dụ: ít đá, không đường…” |  |
| 12 | Text | Bộ đếm số ký tự đã nhập “0/200” |  |
Bảng 43. Mô tả màn hình Thanh toán – Đơn của bạn (UC 7.2)

#### Màn hình Thanh toán – Phương thức thanh toán (UC 7.2)
Hình 38. Màn hình Thanh toán – Phương thức thanh toán (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Tên món và số lượng: “Bạc xỉu x2” |  |
| 2 | Text | Thành tiền của món | Thành tiền = giá × số lượng |
| 3 | Text | Chữ “Tổng tiền” |  |
| 4 | Text | Tổng tiền của đơn |  |
| 5 | Text | Tiêu đề “Phương thức thanh toán” |  |
| 6 | Radio | Lựa chọn “Chuyển khoản – Quét mã QR ngân hàng” |  |
| 7 | Radio | Lựa chọn “Tiền mặt – Trả tiền khi nhận món tại bàn” |  |
Bảng 44. Mô tả màn hình Thanh toán – Phương thức thanh toán (UC 7.2)

#### Màn hình Thanh toán chuyển khoản (UC 7.2)
Hình 39. Màn hình Thanh toán chuyển khoản (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Số bàn và phương thức đã chọn “Bàn 03 · Chuyển khoản” |  |
| 2 | Text | Dòng chữ “Quét mã QR để chuyển khoản” |  |
| 3 | Image | Mã QR ngân hàng để khách quét chuyển khoản | Mã QR có sẵn số tiền của đơn |
| 4 | Text | Số tiền cần chuyển |  |
| 5 | Text | Tên ngân hàng |  |
| 6 | Text | Số tài khoản của quán |  |
| 7 | Text | Tên chủ tài khoản |  |
| 8 | Text | Nội dung chuyển khoản | Nội dung là số bàn |
| 9 | Button | Nút “Hoàn tất”, nhấn sau khi đã chuyển khoản để gửi đơn | Đơn được lưu với trạng thái “Chưa xác nhận thanh toán” |
| 10 | Text | Lời nhắc “Sau khi chuyển khoản, nhấn Hoàn tất. Vui lòng chụp lại giao dịch để đối chiếu khi cần thiết” |  |
Bảng 45. Mô tả màn hình Thanh toán chuyển khoản (UC 7.2)

#### Màn hình Thanh toán tiền mặt (UC 7.2)
Hình 40. Màn hình Thanh toán tiền mặt (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Số bàn và phương thức đã chọn “Bàn 03 · Tiền mặt” |  |
| 2 | Text | Chữ “Tổng tiền” |  |
| 3 | Text | Tổng tiền của đơn |  |
| 4 | Text | Thông báo “Chờ thu tiền sau khi bưng nước ra” |  |
| 5 | Button | Nút “Hoàn tất”, nhấn để gửi đơn | Đơn được lưu với trạng thái “Chưa xác nhận thanh toán” |
Bảng 46. Mô tả màn hình Thanh toán tiền mặt (UC 7.2)

#### Màn hình Đặt món thành công (UC 7.2)
Hình 41. Màn hình Đặt món thành công (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Đặt món thành công” | Hiện khi đơn được lưu thành công |
Bảng 47. Mô tả màn hình Đặt món thành công (UC 7.2)

#### Màn hình Đặt món không thành công (UC 7.2)
Hình 42. Màn hình Đặt món không thành công (UC 7.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Đặt món không thành công, vui lòng thử lại!” | Hiện khi lưu đơn bị lỗi |
Bảng 48. Mô tả màn hình Đặt món không thành công (UC 7.2)


### Đặc tả giao diện đăng nhập

#### Màn hình Đăng nhập (UC 1)
Hình 43. Màn hình Đăng nhập (UC 1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Tiêu đề “Đăng nhập” |  |
| 2 | Text | Dòng chữ “Vui lòng nhập thông tin tài khoản để vào ứng dụng” |  |
| 3 | Input Text | Ô nhập tên đăng nhập | Không được để trống |
| 4 | Input Text | Ô nhập mật khẩu, mật khẩu hiện dạng dấu chấm | Không được để trống |
| 5 | Icon | Icon con mắt, nhấn để hiện hoặc ẩn mật khẩu |  |
| 6 | Button | Nút “Đăng nhập”, nhấn để đăng nhập vào hệ thống |  |
| 7 | Image | Hình nền ly cà phê |  |
Bảng 49. Mô tả màn hình Đăng nhập (UC 1)

#### Màn hình Đăng nhập – Thiếu tên đăng nhập (UC 1)
Hình 44. Màn hình Đăng nhập – Thiếu tên đăng nhập (UC 1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô tên đăng nhập | Hiện khi bỏ trống tên đăng nhập, ô nhập đổi viền đỏ |
Bảng 50. Mô tả màn hình Đăng nhập – Thiếu tên đăng nhập (UC 1)

#### Màn hình Đăng nhập – Thiếu mật khẩu (UC 1)
Hình 45. Màn hình Đăng nhập – Thiếu mật khẩu (UC 1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô mật khẩu | Hiện khi bỏ trống mật khẩu, ô nhập đổi viền đỏ |
Bảng 51. Mô tả màn hình Đăng nhập – Thiếu mật khẩu (UC 1)

#### Màn hình Đăng nhập – Thiếu tên đăng nhập và mật khẩu (UC 1)
Hình 46. Màn hình Đăng nhập – Thiếu tên đăng nhập và mật khẩu (UC 1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô tên đăng nhập | Hiện khi bỏ trống tên đăng nhập, ô nhập đổi viền đỏ |
| 2 | Text | Thông báo lỗi “Không được để trống!” dưới ô mật khẩu | Hiện khi bỏ trống mật khẩu, ô nhập đổi viền đỏ |
Bảng 52. Mô tả màn hình Đăng nhập – Thiếu tên đăng nhập và mật khẩu (UC 1)

#### Màn hình Đăng nhập không thành công (UC 1)
Hình 47. Màn hình Đăng nhập không thành công (UC 1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Đăng nhập không thành công!” | Hiện khi tên đăng nhập hoặc mật khẩu không đúng |
Bảng 53. Mô tả màn hình Đăng nhập không thành công (UC 1)

#### Màn hình Trang chủ sau khi đăng nhập thành công (UC 1)
Hình 48. Màn hình Trang chủ (UC 1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Tiêu đề “Trang chủ” |  |
| 2 | Icon | Icon chuông thông báo | Báo khi có đơn mới |
| 3 | Button | Avatar “C” của chủ quán, nhấn để mở menu “Đổi mật khẩu” và “Đăng xuất” |  |
| 4 | Text | Lời chào “Chào mừng bạn đã quay trở lại!” |  |
| 5 | Button | Thẻ “Đơn hàng”, kèm số đơn chưa xác nhận. Nhấn để mở danh sách đơn |  |
| 6 | Button | Thẻ “Menu – Thực đơn của quán”, nhấn để mở danh sách món |  |
| 7 | Button | Thẻ “Bàn – Trạng thái và mã QR”, nhấn để mở sơ đồ bàn |  |
| 8 | Button | Thẻ “Doanh thu – Thống kê bán hàng”, nhấn để mở màn hình doanh thu |  |
| 9 | Button | Mục “Trang chủ” trên thanh điều hướng, nhấn để về màn hình Trang chủ | Đang được chọn, tô màu đỏ |
| 10 | Button | Mục “Đơn hàng” trên thanh điều hướng, nhấn để mở danh sách đơn |  |
| 11 | Button | Mục “Menu” trên thanh điều hướng, nhấn để mở danh sách món |  |
| 12 | Button | Mục “Bàn” trên thanh điều hướng, nhấn để mở sơ đồ bàn |  |
| 13 | Button | Mục “Doanh thu” trên thanh điều hướng, nhấn để mở màn hình doanh thu |  |
Bảng 54. Mô tả màn hình Trang chủ (UC 1)


### Đặc tả giao diện quản lý gọi món

#### Màn hình Danh sách đơn (UC 2.1, UC 2.2, UC 2.3)
Hình 49. Màn hình Danh sách đơn (UC 2.1, UC 2.2, UC 2.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon quay lại, nhấn để trở về màn hình trước |  |
| 2 | Text | Tiêu đề “Quản lý gọi món” |  |
| 3 | Icon | Icon chuông thông báo | Báo khi có đơn mới |
| 4 | Button | Avatar “C” của chủ quán, nhấn để mở menu “Đổi mật khẩu” và “Đăng xuất” |  |
| 5 | Text | Đường dẫn “Danh sách đơn >> 31/10/2026” | Cho biết đang xem ngày nào |
| 6 | Text | Số đơn của ngày đang xem |  |
| 7 | Button | Ô chọn ngày, nhấn để mở lịch chọn ngày khác | Mặc định là ngày hôm nay |
| 8 | Text | Mã đơn và số bàn của đơn | Đơn mới nhất nằm trên cùng |
| 9 | Text | Giờ đặt và tổng tiền của đơn |  |
| 10 | Text | Nhãn trạng thái đơn: “Chưa xác nhận thanh toán” (màu vàng) hoặc “Đã xác nhận thanh toán” (màu xanh) |  |
| 11 | Button | Nút “Xóa”, nhấn để xóa đơn |  |
| 12 | Button | Mục “Trang chủ” trên thanh điều hướng, nhấn để về màn hình Trang chủ |  |
| 13 | Button | Mục “Đơn hàng” trên thanh điều hướng, nhấn để mở danh sách đơn | Đang được chọn, tô màu đỏ |
| 14 | Button | Mục “Menu” trên thanh điều hướng, nhấn để mở danh sách món |  |
| 15 | Button | Mục “Bàn” trên thanh điều hướng, nhấn để mở sơ đồ bàn |  |
| 16 | Button | Mục “Doanh thu” trên thanh điều hướng, nhấn để mở màn hình doanh thu |  |
Bảng 55. Mô tả màn hình Danh sách đơn (UC 2.1, UC 2.2, UC 2.3)

#### Màn hình Chi tiết đơn chưa xác nhận thanh toán (UC 2.1)
Hình 50. Màn hình Chi tiết đơn chưa xác nhận thanh toán (UC 2.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Mã đơn |  |
| 2 | Text | Số bàn của đơn |  |
| 3 | Text | Nhãn trạng thái “Chưa xác nhận thanh toán” |  |
| 4 | Text | Tiêu đề “Món đã gọi” |  |
| 5 | Text | Ngày giờ đặt đơn |  |
| 6 | Text | Món trong đơn gồm tên món, đơn giá, số lượng, thành tiền |  |
| 7 | Text | Tổng tiền của đơn |  |
| 8 | Text | Phương thức thanh toán của đơn |  |
| 9 | Text | Ghi chú của khách |  |
| 10 | Button | Nút “Xác nhận đã nhận tiền”, nhấn sau khi đã nhận đủ tiền của đơn | Chỉ hiện với đơn chưa xác nhận thanh toán |
| 11 | Button | Nút “Xóa đơn”, nhấn để xóa đơn |  |
Bảng 56. Mô tả màn hình Chi tiết đơn chưa xác nhận thanh toán (UC 2.1)

#### Màn hình Bấm xác nhận đã nhận tiền (UC 2.1)
Hình 51. Màn hình Xác nhận đã nhận tiền (UC 2.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Câu hỏi “Bạn đã nhận đủ tiền của đơn này chưa?” |  |
| 2 | Button | Nút “Không”, nhấn để đóng hộp thoại, đơn giữ nguyên |  |
| 3 | Button | Nút “Có”, nhấn để xác nhận đã nhận tiền | Đơn chuyển sang “Đã xác nhận thanh toán” và được tính vào doanh thu |
Bảng 57. Mô tả màn hình Xác nhận đã nhận tiền (UC 2.1)

#### Màn hình Xác nhận đã nhận tiền thành công (UC 2.1)
Hình 52. Màn hình Xác nhận đã nhận tiền thành công (UC 2.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Nhãn trạng thái đổi thành “Đã xác nhận thanh toán” | Nút “Xác nhận đã nhận tiền” không còn hiện |
| 2 | Icon | Icon dấu tích màu xanh |  |
| 3 | Text | Thông báo “Xác nhận đã nhận tiền!” | Hiện khi lưu thành công |
Bảng 58. Mô tả màn hình Xác nhận đã nhận tiền thành công (UC 2.1)

#### Màn hình Xác nhận đã nhận tiền – Lỗi lưu (UC 2.1)
Hình 53. Màn hình Xác nhận đã nhận tiền – Lỗi lưu (UC 2.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi lưu không thành công, đơn vẫn “Chưa xác nhận thanh toán” |
Bảng 59. Mô tả màn hình Xác nhận đã nhận tiền – Lỗi lưu (UC 2.1)

#### Màn hình Danh sách đơn – Chọn ngày (UC 2.2)
Hình 54. Màn hình Danh sách đơn – Chọn ngày (UC 2.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Tháng và năm đang xem: “Tháng 10, 2026” |  |
| 2 | Text | Lịch các ngày trong tháng |  |
| 3 | Button | Ngày được chọn, tô màu đỏ |  |
| 4 | Button | Nút “Tiếp tục”, nhấn để xem danh sách đơn của ngày đã chọn |  |
Bảng 60. Mô tả màn hình Danh sách đơn – Chọn ngày (UC 2.2)

#### Màn hình Danh sách đơn – Chưa có đơn (UC 2.2)
Hình 55. Màn hình Danh sách đơn – Chưa có đơn (UC 2.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Số đơn của ngày đang xem, ví dụ “0 đơn hàng” |  |
| 2 | Button | Ô chọn ngày, nhấn để chọn ngày khác |  |
| 3 | Icon | Icon danh sách đơn |  |
| 4 | Text | Thông báo “Chưa có đơn nào” | Hiện khi ngày đang xem không có đơn |
Bảng 61. Mô tả màn hình Danh sách đơn – Chưa có đơn (UC 2.2)

#### Màn hình Danh sách đơn – Lỗi truy xuất dữ liệu (UC 2.2)
Hình 56. Màn hình Danh sách đơn – Lỗi truy xuất dữ liệu (UC 2.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi hệ thống không lấy được danh sách đơn |
Bảng 62. Mô tả màn hình Danh sách đơn – Lỗi truy xuất dữ liệu (UC 2.2)

#### Màn hình Chi tiết đơn (UC 2.2)
Hình 57. Màn hình Chi tiết đơn (UC 2.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Đường dẫn “Danh sách đơn >> Chi tiết đơn” |  |
| 2 | Text | Mã đơn |  |
| 3 | Text | Số bàn của đơn |  |
| 4 | Text | Nhãn trạng thái đơn |  |
| 5 | Text | Tiêu đề “Món đã gọi” |  |
| 6 | Text | Ngày giờ đặt đơn |  |
| 7 | Text | Tên các cột: Tên món / Đơn giá, SL, Thành tiền |  |
| 8 | Text | Các món trong đơn gồm tên món, đơn giá, số lượng, thành tiền | Thành tiền = đơn giá × số lượng |
| 9 | Text | Tổng tiền của đơn | Tổng tiền = cộng thành tiền các món |
| 10 | Text | Phương thức thanh toán của đơn |  |
| 11 | Text | Ghi chú của khách |  |
| 12 | Button | Nút “Xóa đơn”, nhấn để xóa đơn | Đơn đã xác nhận thanh toán thì không có nút “Xác nhận đã nhận tiền” |
Bảng 63. Mô tả màn hình Chi tiết đơn (UC 2.2)

#### Màn hình Xác nhận xóa đơn từ danh sách (UC 2.3)
Hình 58. Màn hình Xác nhận xóa đơn từ danh sách (UC 2.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “Xóa” của đơn cần xóa, ví dụ đơn #0101 |  |
| 2 | Text | Câu hỏi “Bạn có chắc chắn muốn xóa đơn này không?” |  |
| 3 | Button | Nút “Hủy”, nhấn để đóng hộp thoại, đơn giữ nguyên |  |
| 4 | Button | Nút “Xóa”, nhấn để xóa đơn | Đơn bị đánh dấu đã xóa, không tính vào thống kê |
Bảng 64. Mô tả màn hình Xác nhận xóa đơn từ danh sách (UC 2.3)

#### Màn hình Xóa đơn thành công (UC 2.3)
Hình 59. Màn hình Xóa đơn thành công (UC 2.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Số đơn sau khi xóa, ví dụ “5 đơn hàng” | Danh sách được cập nhật, không còn đơn đã xóa |
| 2 | Icon | Icon dấu tích màu xanh |  |
| 3 | Text | Thông báo “Đã xóa đơn” | Hiện khi xóa đơn thành công |
Bảng 65. Mô tả màn hình Xóa đơn thành công (UC 2.3)

#### Màn hình Xác nhận xóa đơn từ chi tiết đơn (UC 2.3)
Hình 60. Màn hình Xác nhận xóa đơn từ chi tiết đơn (UC 2.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “Xóa đơn” ở màn hình Chi tiết đơn |  |
| 2 | Text | Câu hỏi “Bạn có chắc chắn muốn xóa đơn này không?” |  |
| 3 | Button | Nút “Hủy”, nhấn để đóng hộp thoại, đơn giữ nguyên |  |
| 4 | Button | Nút “Xóa”, nhấn để xóa đơn |  |
Bảng 66. Mô tả màn hình Xác nhận xóa đơn từ chi tiết đơn (UC 2.3)

#### Màn hình Xóa đơn thành công từ chi tiết đơn (UC 2.3)
Hình 61. Màn hình Xóa đơn thành công từ chi tiết đơn (UC 2.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Đã xóa đơn” | Sau đó quay về danh sách đơn |
Bảng 67. Mô tả màn hình Xóa đơn thành công từ chi tiết đơn (UC 2.3)

#### Màn hình Xóa đơn – Lỗi lưu (UC 2.3)
Hình 62. Màn hình Xóa đơn – Lỗi lưu (UC 2.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi xóa không thành công, đơn vẫn giữ nguyên |
Bảng 68. Mô tả màn hình Xóa đơn – Lỗi lưu (UC 2.3)


### Đặc tả giao diện quản lý menu

#### Màn hình Danh sách món (UC 3.1)
Hình 63. Màn hình Danh sách món (UC 3.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon quay lại, nhấn để trở về màn hình trước |  |
| 2 | Text | Tiêu đề “Quản lý menu” |  |
| 3 | Icon | Icon chuông thông báo | Báo khi có đơn mới |
| 4 | Button | Avatar “C” của chủ quán, nhấn để mở menu “Đổi mật khẩu” và “Đăng xuất” |  |
| 5 | Text | Tiêu đề “Danh sách món” |  |
| 6 | Button | Nút “+ Thêm món”, nhấn để mở màn hình thêm món |  |
| 7 | Image | Hình ảnh của món | Món không có hình thì dùng hình mặc định |
| 8 | Text | Tên món |  |
| 9 | Text | Giá bán của món |  |
| 10 | Text | Trạng thái của món “Hiển thị” hoặc “Ẩn” | Món “Ẩn” không hiện cho khách |
| 11 | Button | Nút “Cập nhật món”, nhấn để sửa thông tin món |  |
| 12 | Button | Nút “Xóa món”, nhấn để xóa món khỏi menu |  |
| 13 | Button | Mục “Trang chủ” trên thanh điều hướng, nhấn để về màn hình Trang chủ |  |
| 14 | Button | Mục “Đơn hàng” trên thanh điều hướng, nhấn để mở danh sách đơn |  |
| 15 | Button | Mục “Menu” trên thanh điều hướng, nhấn để mở danh sách món | Đang được chọn, tô màu đỏ |
| 16 | Button | Mục “Bàn” trên thanh điều hướng, nhấn để mở sơ đồ bàn |  |
| 17 | Button | Mục “Doanh thu” trên thanh điều hướng, nhấn để mở màn hình doanh thu |  |
Bảng 69. Mô tả màn hình Danh sách món (UC 3.1)

#### Màn hình Danh sách món – Chưa có món (UC 3.1)
Hình 64. Màn hình Danh sách món – Chưa có món (UC 3.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon ly cà phê |  |
| 2 | Text | Thông báo “Menu chưa có món nào” | Hiện khi menu chưa có món nào |
Bảng 70. Mô tả màn hình Danh sách món – Chưa có món (UC 3.1)

#### Màn hình Danh sách món – Lỗi tải dữ liệu (UC 3.1)
Hình 65. Màn hình Danh sách món – Lỗi tải dữ liệu (UC 3.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi hệ thống không lấy được danh sách món |
Bảng 71. Mô tả màn hình Danh sách món – Lỗi tải dữ liệu (UC 3.1)

#### Màn hình Danh sách món – Chọn thêm món (UC 3.2)
Hình 66. Màn hình Danh sách món – Chọn thêm món (UC 3.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “+ Thêm món”, nhấn để mở màn hình thêm món | Nút được nhấn chuyển sang màu nhạt |
Bảng 72. Mô tả màn hình Danh sách món – Chọn thêm món (UC 3.2)

#### Màn hình Thêm món (UC 3.2)
Hình 67. Màn hình Thêm món (UC 3.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Đường dẫn “Quản lý menu >> Thêm món” |  |
| 2 | Text | Nhãn “Tên món” |  |
| 3 | Input Text | Ô nhập tên món | Không được để trống, không trùng tên món đã có |
| 4 | Text | Nhãn “Giá bán” |  |
| 5 | Input Text | Ô nhập giá bán, đơn vị đ | Không được để trống, phải là số lớn hơn 0 |
| 6 | Text | Nhãn “Hình ảnh minh họa” và dòng “Không chọn hình sẽ dùng hình mặc định” |  |
| 7 | Image | Khung xem trước hình ảnh của món | Chưa chọn thì hiện hình mặc định |
| 8 | Button | Nút “Chọn hình ảnh”, nhấn để chọn hình từ máy | Không bắt buộc |
| 9 | Button | Nút “Lưu”, nhấn để lưu món mới | Món mới mặc định ở trạng thái “Hiển thị” |
Bảng 73. Mô tả màn hình Thêm món (UC 3.2)

#### Màn hình Thêm món – Bỏ trống thông tin (UC 3.2)
Hình 68. Màn hình Thêm món – Bỏ trống thông tin (UC 3.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô tên món |  |
| 2 | Text | Thông báo lỗi “Không được để trống!” dưới ô giá bán |  |
| 3 | Image | Hình ảnh đã chọn vẫn được giữ lại |  |
| 4 | Button | Nút đổi thành “Đổi hình ảnh” sau khi đã chọn hình |  |
Bảng 74. Mô tả màn hình Thêm món – Bỏ trống thông tin (UC 3.2)

#### Màn hình Thêm món – Thông tin không hợp lệ (UC 3.2)
Hình 69. Màn hình Thêm món – Thông tin không hợp lệ (UC 3.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Tên món đã tồn tại!” | Hiện khi tên món trùng với món đang có |
| 2 | Text | Thông báo lỗi “Giá bán phải là số lớn hơn 0!” | Hiện khi giá bán bằng 0 hoặc không phải số |
Bảng 75. Mô tả màn hình Thêm món – Thông tin không hợp lệ (UC 3.2)

#### Màn hình Thêm món thành công (UC 3.2)
Hình 70. Màn hình Thêm món thành công (UC 3.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Thêm món thành công” | Hiện khi lưu món thành công |
| 3 | Text | Món mới thêm hiện ở đầu danh sách, ví dụ “Trà vải” | Không chọn hình nên dùng hình mặc định |
Bảng 76. Mô tả màn hình Thêm món thành công (UC 3.2)

#### Màn hình Thêm món – Lỗi lưu (UC 3.2)
Hình 71. Màn hình Thêm món – Lỗi lưu (UC 3.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi lưu món không thành công |
Bảng 77. Mô tả màn hình Thêm món – Lỗi lưu (UC 3.2)

#### Màn hình Danh sách món – Chọn xóa món (UC 3.3)
Hình 72. Màn hình Danh sách món – Chọn xóa món (UC 3.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Món được chọn để xóa, ví dụ “Bạc xỉu” |  |
| 2 | Button | Nút “Xóa món”, nhấn để xóa món | Nút được nhấn chuyển sang màu nhạt |
Bảng 78. Mô tả màn hình Danh sách món – Chọn xóa món (UC 3.3)

#### Màn hình Xác nhận xóa món (UC 3.3)
Hình 73. Màn hình Xác nhận xóa món (UC 3.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Câu hỏi “Bạn có chắc chắn muốn xóa món này không?” |  |
| 2 | Button | Nút “Hủy”, nhấn để đóng hộp thoại, món giữ nguyên |  |
| 3 | Button | Nút “Xóa”, nhấn để xóa món | Món bị đánh dấu đã xóa, đơn cũ vẫn giữ tên và giá món |
Bảng 79. Mô tả màn hình Xác nhận xóa món (UC 3.3)

#### Màn hình Xóa món thành công (UC 3.3)
Hình 74. Màn hình Xóa món thành công (UC 3.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Đã xóa món thành công” | Hiện khi xóa món thành công |
Bảng 80. Mô tả màn hình Xóa món thành công (UC 3.3)

#### Màn hình Danh sách món sau khi xóa (UC 3.3)
Hình 75. Màn hình Danh sách món sau khi xóa (UC 3.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Danh sách món đã cập nhật, không còn món “Bạc xỉu” |  |
| 2 | Text | Nhãn trạng thái “Ẩn” của món đang tạm ẩn | Món “Ẩn” vẫn còn trong menu nhưng khách không thấy |
Bảng 81. Mô tả màn hình Danh sách món sau khi xóa (UC 3.3)

#### Màn hình Danh sách món – Chọn cập nhật món (UC 3.4)
Hình 76. Màn hình Danh sách món – Chọn cập nhật món (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Món được chọn để cập nhật, ví dụ “Cà phê sữa” |  |
| 2 | Button | Nút “Cập nhật món”, nhấn để mở màn hình cập nhật món | Nút được nhấn chuyển sang màu nhạt |
Bảng 82. Mô tả màn hình Danh sách món – Chọn cập nhật món (UC 3.4)

#### Màn hình Cập nhật món (UC 3.4)
Hình 77. Màn hình Cập nhật món (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Đường dẫn “Quản lý menu >> Cập nhật món” |  |
| 2 | Input Text | Ô “Tên món”, hiện sẵn tên món hiện tại |  |
| 3 | Input Text | Ô “Giá bán”, hiện sẵn giá hiện tại |  |
| 4 | Image | Hình ảnh hiện tại của món |  |
| 5 | Button | Nút “Đổi hình ảnh”, nhấn để chọn hình mới |  |
| 6 | Text | Nhãn “Trạng thái” |  |
| 7 | Button | Nút “Hiển thị”, chọn để món hiện cho khách |  |
| 8 | Button | Nút “Ẩn”, chọn để tạm ẩn món với khách |  |
| 9 | Button | Nút “Lưu”, nhấn để lưu thông tin món |  |
Bảng 83. Mô tả màn hình Cập nhật món (UC 3.4)

#### Màn hình Cập nhật món – Sửa thông tin (UC 3.4)
Hình 78. Màn hình Cập nhật món – Sửa thông tin (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Input Text | Giá bán đã sửa, ví dụ từ 25000 thành 27000 |  |
| 2 | Button | Nút “Lưu”, nhấn để lưu thay đổi | Nút được nhấn chuyển sang màu nhạt |
Bảng 84. Mô tả màn hình Cập nhật món – Sửa thông tin (UC 3.4)

#### Màn hình Cập nhật món – Bỏ trống thông tin (UC 3.4)
Hình 79. Màn hình Cập nhật món – Bỏ trống thông tin (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô tên món | Ô nhập đổi viền đỏ |
| 2 | Text | Thông báo lỗi “Không được để trống!” dưới ô giá bán | Ô nhập đổi viền đỏ |
| 3 | Button | Trạng thái đã chọn vẫn được giữ lại | Chỉ báo lỗi ở ô sai |
Bảng 85. Mô tả màn hình Cập nhật món – Bỏ trống thông tin (UC 3.4)

#### Màn hình Cập nhật món – Thông tin không hợp lệ (UC 3.4)
Hình 80. Màn hình Cập nhật món – Thông tin không hợp lệ (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Tên món đã tồn tại!” | Hiện khi tên trùng với món khác |
| 2 | Text | Thông báo lỗi “Giá bán phải là số lớn hơn 0!” | Hiện khi giá bằng 0 hoặc không phải số |
Bảng 86. Mô tả màn hình Cập nhật món – Thông tin không hợp lệ (UC 3.4)

#### Màn hình Cập nhật món thành công (UC 3.4)
Hình 81. Màn hình Cập nhật món thành công (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Cập nhật món thành công” | Hiện khi lưu thành công |
Bảng 87. Mô tả màn hình Cập nhật món thành công (UC 3.4)

#### Màn hình Danh sách món sau khi cập nhật (UC 3.4)
Hình 82. Màn hình Danh sách món sau khi cập nhật (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Giá mới của món, ví dụ Cà phê sữa “27.000đ” | Danh sách được cập nhật theo thông tin mới |
Bảng 88. Mô tả màn hình Danh sách món sau khi cập nhật (UC 3.4)

#### Màn hình Cập nhật món – Lỗi lưu (UC 3.4)
Hình 83. Màn hình Cập nhật món – Lỗi lưu (UC 3.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi lưu không thành công, món giữ thông tin cũ |
Bảng 89. Mô tả màn hình Cập nhật món – Lỗi lưu (UC 3.4)


### Đặc tả giao diện quản lý bàn

#### Màn hình Sơ đồ bàn (UC 4.1)
Hình 84. Màn hình Sơ đồ bàn (UC 4.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon quay lại, nhấn để trở về màn hình trước |  |
| 2 | Text | Tiêu đề “Quản lý bàn” |  |
| 3 | Icon | Icon chuông thông báo | Báo khi có đơn mới |
| 4 | Button | Avatar “C” của chủ quán, nhấn để mở menu “Đổi mật khẩu” và “Đăng xuất” |  |
| 5 | Text | Tiêu đề “Sơ đồ bàn” |  |
| 6 | Button | Nút “+ Thêm bàn”, nhấn để mở màn hình thêm bàn |  |
| 7 | Button | Ô bàn đang trống, màu xanh dương. Nhấn để xem thông tin bàn |  |
| 8 | Text | Số bàn, ví dụ “Bàn 01” |  |
| 9 | Text | Trạng thái bàn “Trống” |  |
| 10 | Button | Ô bàn đang phục vụ, màu vàng, trạng thái “Đang phục vụ” | Bàn chuyển sang “Đang phục vụ” khi khách gửi đơn |
| 11 | Button | Mục “Trang chủ” trên thanh điều hướng, nhấn để về màn hình Trang chủ |  |
| 12 | Button | Mục “Đơn hàng” trên thanh điều hướng, nhấn để mở danh sách đơn |  |
| 13 | Button | Mục “Menu” trên thanh điều hướng, nhấn để mở danh sách món |  |
| 14 | Button | Mục “Bàn” trên thanh điều hướng, nhấn để mở sơ đồ bàn | Đang được chọn, tô màu đỏ |
| 15 | Button | Mục “Doanh thu” trên thanh điều hướng, nhấn để mở màn hình doanh thu |  |
Bảng 90. Mô tả màn hình Sơ đồ bàn (UC 4.1)

#### Màn hình Sơ đồ bàn – Chưa có bàn (UC 4.1)
Hình 85. Màn hình Sơ đồ bàn – Chưa có bàn (UC 4.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon danh sách |  |
| 2 | Text | Thông báo “Chưa có bàn nào” | Hiện khi hệ thống chưa có bàn nào |
Bảng 91. Mô tả màn hình Sơ đồ bàn – Chưa có bàn (UC 4.1)

#### Màn hình Sơ đồ bàn – Lỗi tải dữ liệu (UC 4.1)
Hình 86. Màn hình Sơ đồ bàn – Lỗi tải dữ liệu (UC 4.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi hệ thống không lấy được sơ đồ bàn |
Bảng 92. Mô tả màn hình Sơ đồ bàn – Lỗi tải dữ liệu (UC 4.1)

#### Màn hình Sơ đồ bàn – Chọn thêm bàn (UC 4.2)
Hình 87. Màn hình Sơ đồ bàn – Chọn thêm bàn (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “+ Thêm bàn”, nhấn để mở màn hình thêm bàn |  |
Bảng 93. Mô tả màn hình Sơ đồ bàn – Chọn thêm bàn (UC 4.2)

#### Màn hình Thêm bàn (UC 4.2)
Hình 88. Màn hình Thêm bàn (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Đường dẫn “Quản lý bàn >> Thêm bàn” |  |
| 2 | Text | Nhãn “Số bàn” |  |
| 3 | Input Text | Ô nhập số bàn |  |
| 4 | Button | Nút “Hủy”, nhấn để đóng màn hình và quay về sơ đồ bàn |  |
| 5 | Button | Nút “Lưu”, nhấn để lưu bàn mới | Bàn mới ở trạng thái “Trống” và được tạo mã QR riêng |
Bảng 94. Mô tả màn hình Thêm bàn (UC 4.2)

#### Màn hình Thêm bàn – Nhập số bàn (UC 4.2)
Hình 89. Màn hình Thêm bàn – Nhập số bàn (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Input Text | Số bàn đã nhập, ví dụ “09” |  |
| 2 | Button | Nút “Lưu”, nhấn để lưu bàn mới |  |
Bảng 95. Mô tả màn hình Thêm bàn – Nhập số bàn (UC 4.2)

#### Màn hình Sơ đồ bàn sau khi hủy thêm bàn (UC 4.2)
Hình 90. Màn hình Sơ đồ bàn sau khi hủy thêm bàn (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Quay về sơ đồ bàn, không có bàn nào được thêm | Hiện sau khi nhấn “Hủy” |
Bảng 96. Mô tả màn hình Sơ đồ bàn sau khi hủy thêm bàn (UC 4.2)

#### Màn hình Thêm bàn – Bỏ trống số bàn (UC 4.2)
Hình 91. Màn hình Thêm bàn – Bỏ trống số bàn (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô số bàn | Hiện khi nhấn “Lưu” mà chưa nhập số bàn |
Bảng 97. Mô tả màn hình Thêm bàn – Bỏ trống số bàn (UC 4.2)

#### Màn hình Thêm bàn – Số bàn đã tồn tại (UC 4.2)
Hình 92. Màn hình Thêm bàn – Số bàn đã tồn tại (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Số bàn đã tồn tại!” dưới ô số bàn | Hiện khi số bàn trùng với bàn đang có |
Bảng 98. Mô tả màn hình Thêm bàn – Số bàn đã tồn tại (UC 4.2)

#### Màn hình Thêm bàn thành công (UC 4.2)
Hình 93. Màn hình Thêm bàn thành công (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Thêm bàn thành công” |  |
| 3 | Text | Số bàn vừa thêm, ví dụ “Bàn 09” |  |
| 4 | Image | Mã QR riêng của bàn | Mã QR gắn sẵn số bàn |
| 5 | Button | Nút “Tải mã QR”, nhấn để tải mã QR về máy | Tải xong quay về sơ đồ bàn |
Bảng 99. Mô tả màn hình Thêm bàn thành công (UC 4.2)

#### Màn hình Thêm bàn – Lỗi lưu (UC 4.2)
Hình 94. Màn hình Thêm bàn – Lỗi lưu (UC 4.2)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi lưu bàn hoặc tạo mã QR không thành công |
Bảng 100. Mô tả màn hình Thêm bàn – Lỗi lưu (UC 4.2)

#### Màn hình Sơ đồ bàn – Chọn bàn trống cần xóa (UC 4.3)
Hình 95. Màn hình Sơ đồ bàn – Chọn bàn trống cần xóa (UC 4.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Ô bàn trống được chọn, ví dụ “Bàn 08” | Ô được nhấn chuyển sang màu nhạt |
Bảng 101. Mô tả màn hình Sơ đồ bàn – Chọn bàn trống cần xóa (UC 4.3)

#### Màn hình Thông tin bàn trống (UC 4.3)
Hình 96. Màn hình Thông tin bàn trống (UC 4.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Khung thông tin của bàn được chọn |  |
| 2 | Text | Số bàn, ví dụ “Bàn 08” |  |
| 3 | Text | Trạng thái bàn “Trống” |  |
| 4 | Button | Nút “Xóa bàn”, nhấn để xóa bàn | Chỉ hiện với bàn đang trống |
Bảng 102. Mô tả màn hình Thông tin bàn trống (UC 4.3)

#### Màn hình Xác nhận xóa bàn (UC 4.3)
Hình 97. Màn hình Xác nhận xóa bàn (UC 4.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Câu hỏi “Bạn có chắc chắn muốn xóa bàn này không?” |  |
| 2 | Button | Nút “Hủy”, nhấn để đóng hộp thoại, bàn giữ nguyên |  |
| 3 | Button | Nút “Xóa”, nhấn để xóa bàn |  |
Bảng 103. Mô tả màn hình Xác nhận xóa bàn (UC 4.3)

#### Màn hình Xóa bàn thành công (UC 4.3)
Hình 98. Màn hình Xóa bàn thành công (UC 4.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Xóa bàn thành công” |  |
Bảng 104. Mô tả màn hình Xóa bàn thành công (UC 4.3)

#### Màn hình Sơ đồ bàn sau khi xóa bàn (UC 4.3)
Hình 99. Màn hình Sơ đồ bàn sau khi xóa bàn (UC 4.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Sơ đồ bàn đã cập nhật, không còn “Bàn 08” |  |
Bảng 105. Mô tả màn hình Sơ đồ bàn sau khi xóa bàn (UC 4.3)

#### Màn hình Xóa bàn – Lỗi lưu (UC 4.3)
Hình 100. Màn hình Xóa bàn – Lỗi lưu (UC 4.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi xóa bàn không thành công |
Bảng 106. Mô tả màn hình Xóa bàn – Lỗi lưu (UC 4.3)

#### Màn hình Sơ đồ bàn – Chọn bàn đang phục vụ (UC 4.4)
Hình 101. Màn hình Sơ đồ bàn – Chọn bàn đang phục vụ (UC 4.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Ô bàn đang phục vụ được chọn, ví dụ “Bàn 03” | Ô được nhấn chuyển sang màu nhạt |
Bảng 107. Mô tả màn hình Sơ đồ bàn – Chọn bàn đang phục vụ (UC 4.4)

#### Màn hình Thông tin bàn đang phục vụ (UC 4.4)
Hình 102. Màn hình Thông tin bàn đang phục vụ (UC 4.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Khung thông tin của bàn được chọn |  |
| 2 | Text | Số bàn, ví dụ “Bàn 03” |  |
| 3 | Text | Trạng thái bàn “Đang phục vụ” |  |
| 4 | Button | Nút “Xóa bàn” |  |
| 5 | Button | Nút “Xác nhận bàn trống”, nhấn khi khách đã rời bàn | Chỉ hiện với bàn đang phục vụ |
Bảng 108. Mô tả màn hình Thông tin bàn đang phục vụ (UC 4.4)

#### Màn hình Xác nhận bàn trống thành công (UC 4.4)
Hình 103. Màn hình Xác nhận bàn trống thành công (UC 4.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Đã đưa bàn về trạng thái Trống” |  |
Bảng 109. Mô tả màn hình Xác nhận bàn trống thành công (UC 4.4)

#### Màn hình Sơ đồ bàn sau khi xác nhận bàn trống (UC 4.4)
Hình 104. Màn hình Sơ đồ bàn sau khi xác nhận bàn trống (UC 4.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Ô “Bàn 03” chuyển về trạng thái “Trống”, màu xanh dương | Sơ đồ bàn được cập nhật |
Bảng 110. Mô tả màn hình Sơ đồ bàn sau khi xác nhận bàn trống (UC 4.4)

#### Màn hình Xác nhận bàn trống – Lỗi lưu (UC 4.4)
Hình 105. Màn hình Xác nhận bàn trống – Lỗi lưu (UC 4.4)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi lưu không thành công, bàn vẫn “Đang phục vụ” |
Bảng 111. Mô tả màn hình Xác nhận bàn trống – Lỗi lưu (UC 4.4)


### Đặc tả giao diện quản lý doanh thu

#### Màn hình Tổng doanh thu theo ngày (UC 5.1)
Hình 106. Màn hình Tổng doanh thu theo ngày (UC 5.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon quay lại, nhấn để trở về màn hình trước |  |
| 2 | Text | Tiêu đề “Quản lý doanh thu” |  |
| 3 | Icon | Icon chuông thông báo | Báo khi có đơn mới |
| 4 | Button | Avatar “C” của chủ quán, nhấn để mở menu “Đổi mật khẩu” và “Đăng xuất” |  |
| 5 | Button | Nút “Ngày”, xem doanh thu theo từng ngày | Mặc định chọn “Ngày”, nút đang chọn màu đỏ |
| 6 | Button | Nút “Tháng”, xem doanh thu theo từng tháng |  |
| 7 | Button | Nút “Năm”, xem doanh thu theo từng năm |  |
| 8 | Text | Tiêu đề “Tổng doanh thu” |  |
| 9 | Button | Một dòng doanh thu gồm ngày và tổng doanh thu. Nhấn để xem chi tiết ngày đó | Ngày mới nhất ở trên cùng. Chỉ tính đơn đã xác nhận thanh toán |
| 10 | Button | Mục “Trang chủ” trên thanh điều hướng, nhấn để về màn hình Trang chủ |  |
| 11 | Button | Mục “Đơn hàng” trên thanh điều hướng, nhấn để mở danh sách đơn |  |
| 12 | Button | Mục “Menu” trên thanh điều hướng, nhấn để mở danh sách món |  |
| 13 | Button | Mục “Bàn” trên thanh điều hướng, nhấn để mở sơ đồ bàn |  |
| 14 | Button | Mục “Doanh thu” trên thanh điều hướng, nhấn để mở màn hình doanh thu | Đang được chọn, tô màu đỏ |
Bảng 112. Mô tả màn hình Tổng doanh thu theo ngày (UC 5.1)

#### Màn hình Tổng doanh thu theo tháng (UC 5.1)
Hình 107. Màn hình Tổng doanh thu theo tháng (UC 5.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “Tháng” đang được chọn |  |
| 2 | Button | Một dòng doanh thu gồm tháng và tổng doanh thu. Nhấn để xem chi tiết tháng đó | Tháng mới nhất ở trên cùng |
Bảng 113. Mô tả màn hình Tổng doanh thu theo tháng (UC 5.1)

#### Màn hình Tổng doanh thu theo năm (UC 5.1)
Hình 108. Màn hình Tổng doanh thu theo năm (UC 5.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Nút “Năm” đang được chọn |  |
| 2 | Button | Một dòng doanh thu gồm năm và tổng doanh thu. Nhấn để xem chi tiết năm đó | Năm mới nhất ở trên cùng |
Bảng 114. Mô tả màn hình Tổng doanh thu theo năm (UC 5.1)

#### Màn hình Tổng doanh thu – Chưa có doanh thu (UC 5.1)
Hình 109. Màn hình Tổng doanh thu – Chưa có doanh thu (UC 5.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon danh sách |  |
| 2 | Text | Thông báo “Chưa có doanh thu nào” | Hiện khi chưa có ngày nào có doanh thu |
Bảng 115. Mô tả màn hình Tổng doanh thu – Chưa có doanh thu (UC 5.1)

#### Màn hình Tổng doanh thu – Lỗi tải dữ liệu (UC 5.1)
Hình 110. Màn hình Tổng doanh thu – Lỗi tải dữ liệu (UC 5.1)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi hệ thống không lấy được dữ liệu doanh thu |
Bảng 116. Mô tả màn hình Tổng doanh thu – Lỗi tải dữ liệu (UC 5.1)

#### Màn hình Chi tiết doanh thu (UC 5.2, UC 5.3)
Hình 111. Màn hình Chi tiết doanh thu (UC 5.2, UC 5.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Đường dẫn “Doanh thu >> 31/10/2026”, cho biết kỳ đang xem |  |
| 2 | Text | Tiêu đề “Doanh thu theo phương thức thanh toán” |  |
| 3 | Text | Doanh thu tiền mặt của kỳ |  |
| 4 | Text | Doanh thu chuyển khoản của kỳ |  |
| 5 | Text | Tổng doanh thu của kỳ | Tổng doanh thu = tiền mặt + chuyển khoản |
| 6 | Text | Tổng số ly bán ra trong kỳ |  |
| 7 | Text | Tên món |  |
| 8 | Text | Nhãn “Bán chạy nhất” của món bán nhiều nhất | Nhiều món cùng số ly cao nhất thì gắn nhãn cho tất cả |
| 9 | Text | Số ly đã bán của món | Danh sách món xếp theo số ly giảm dần |
Bảng 117. Mô tả màn hình Chi tiết doanh thu (UC 5.2, UC 5.3)

#### Màn hình Chi tiết doanh thu – Lỗi tải dữ liệu (UC 5.2, UC 5.3)
Hình 112. Màn hình Chi tiết doanh thu – Lỗi tải dữ liệu (UC 5.2, UC 5.3)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi hệ thống không lấy được chi tiết doanh thu |
Bảng 118. Mô tả màn hình Chi tiết doanh thu – Lỗi tải dữ liệu (UC 5.2, UC 5.3)


### Đặc tả giao diện đổi mật khẩu

#### Màn hình Đổi mật khẩu (UC 6)
Hình 113. Màn hình Đổi mật khẩu (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon quay lại, nhấn để trở về màn hình trước |  |
| 2 | Text | Tiêu đề “Đổi mật khẩu” |  |
| 3 | Icon | Icon chuông thông báo |  |
| 4 | Button | Avatar “C” của chủ quán, nhấn để mở menu “Đổi mật khẩu” và “Đăng xuất” |  |
| 5 | Text | Đường dẫn “Trang chủ >> Đổi mật khẩu” |  |
| 6 | Text | Dòng chữ “Vui lòng nhập thông tin tài khoản để đổi mật khẩu” |  |
| 7 | Input Text | Ô nhập mật khẩu cũ | Không được để trống, phải đúng mật khẩu hiện tại |
| 8 | Text | Chữ gợi ý (placeholder) “Mật khẩu cũ” | Tự ẩn khi bắt đầu nhập |
| 9 | Input Text | Ô nhập mật khẩu mới | Không được để trống |
| 10 | Text | Chữ gợi ý (placeholder) “Mật khẩu mới” | Tự ẩn khi bắt đầu nhập |
| 11 | Input Text | Ô nhập lại mật khẩu mới | Phải giống mật khẩu mới |
| 12 | Text | Chữ gợi ý (placeholder) “Nhập lại mật khẩu mới” | Tự ẩn khi bắt đầu nhập |
| 13 | Icon | Icon con mắt, nhấn để hiện hoặc ẩn mật khẩu |  |
| 14 | Button | Nút “Lưu”, nhấn để đổi mật khẩu | Đổi xong chuyển về màn hình Đăng nhập |
| 15 | Button | Mục “Trang chủ” trên thanh điều hướng, nhấn để về màn hình Trang chủ | Đang được chọn, tô màu đỏ |
| 16 | Button | Mục “Đơn hàng” trên thanh điều hướng, nhấn để mở danh sách đơn |  |
| 17 | Button | Mục “Menu” trên thanh điều hướng, nhấn để mở danh sách món |  |
| 18 | Button | Mục “Bàn” trên thanh điều hướng, nhấn để mở sơ đồ bàn |  |
| 19 | Button | Mục “Doanh thu” trên thanh điều hướng, nhấn để mở màn hình doanh thu |  |
Bảng 119. Mô tả màn hình Đổi mật khẩu (UC 6)

#### Màn hình Đổi mật khẩu – Nhập đủ thông tin (UC 6)
Hình 114. Màn hình Đổi mật khẩu – Nhập đủ thông tin (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Input Text | Ba ô mật khẩu đã nhập, hiện dạng dấu chấm |  |
| 2 | Button | Nút “Lưu”, nhấn để lưu mật khẩu mới |  |
Bảng 120. Mô tả màn hình Đổi mật khẩu – Nhập đủ thông tin (UC 6)

#### Màn hình Đổi mật khẩu – Thiếu mật khẩu cũ (UC 6)
Hình 115. Màn hình Đổi mật khẩu – Thiếu mật khẩu cũ (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô mật khẩu cũ |  |
Bảng 121. Mô tả màn hình Đổi mật khẩu – Thiếu mật khẩu cũ (UC 6)

#### Màn hình Đổi mật khẩu – Thiếu mật khẩu mới (UC 6)
Hình 116. Màn hình Đổi mật khẩu – Thiếu mật khẩu mới (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô mật khẩu mới |  |
Bảng 122. Mô tả màn hình Đổi mật khẩu – Thiếu mật khẩu mới (UC 6)

#### Màn hình Đổi mật khẩu – Thiếu nhập lại mật khẩu mới (UC 6)
Hình 117. Màn hình Đổi mật khẩu – Thiếu nhập lại mật khẩu mới (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô nhập lại mật khẩu mới |  |
Bảng 123. Mô tả màn hình Đổi mật khẩu – Thiếu nhập lại mật khẩu mới (UC 6)

#### Màn hình Đổi mật khẩu – Thiếu cả ba trường (UC 6)
Hình 118. Màn hình Đổi mật khẩu – Thiếu cả ba trường (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Thông báo lỗi “Không được để trống!” dưới ô mật khẩu cũ |  |
| 2 | Text | Thông báo lỗi “Không được để trống!” dưới ô mật khẩu mới |  |
| 3 | Text | Thông báo lỗi “Không được để trống!” dưới ô nhập lại mật khẩu mới |  |
Bảng 124. Mô tả màn hình Đổi mật khẩu – Thiếu cả ba trường (UC 6)

#### Màn hình Đổi mật khẩu – Mật khẩu cũ không đúng (UC 6)
Hình 119. Màn hình Đổi mật khẩu – Mật khẩu cũ không đúng (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Mật khẩu cũ không đúng!” | Hiện khi mật khẩu cũ không khớp với mật khẩu hiện tại |
Bảng 125. Mô tả màn hình Đổi mật khẩu – Mật khẩu cũ không đúng (UC 6)

#### Màn hình Đổi mật khẩu – Lỗi lưu (UC 6)
Hình 120. Màn hình Đổi mật khẩu – Lỗi lưu (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi lưu mật khẩu mới không thành công |
Bảng 126. Mô tả màn hình Đổi mật khẩu – Lỗi lưu (UC 6)

#### Màn hình Đổi mật khẩu thành công (UC 6)
Hình 121. Màn hình Đổi mật khẩu thành công (UC 6)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon dấu tích màu xanh |  |
| 2 | Text | Thông báo “Đổi mật khẩu thành công!” |  |
| 3 | Text | Màn hình Đăng nhập hiện phía sau, các ô để trống |  |
Bảng 127. Mô tả màn hình Đổi mật khẩu thành công (UC 6)


### Đặc tả giao diện đăng xuất

#### Màn hình Trang chủ – Chọn đăng xuất (UC 8)
Hình 122. Màn hình Trang chủ – Chọn đăng xuất (UC 8)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Button | Avatar “C” của chủ quán, nhấn để mở menu tài khoản |  |
| 2 | Text | Menu tài khoản gồm “Đổi mật khẩu” và “Đăng xuất” |  |
| 3 | Button | Mục “Đổi mật khẩu”, nhấn để mở màn hình đổi mật khẩu |  |
| 4 | Button | Mục “Đăng xuất”, nhấn để đăng xuất khỏi hệ thống |  |
Bảng 128. Mô tả màn hình Trang chủ – Chọn đăng xuất (UC 8)

#### Màn hình Xác nhận đăng xuất (UC 8)
Hình 123. Màn hình Xác nhận đăng xuất (UC 8)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Text | Câu hỏi “Bạn có muốn đăng xuất không?” |  |
| 2 | Button | Nút “Không”, nhấn để đóng hộp thoại, giữ nguyên màn hình hiện tại |  |
| 3 | Button | Nút “Có”, nhấn để đăng xuất | Kết thúc phiên đăng nhập |
Bảng 129. Mô tả màn hình Xác nhận đăng xuất (UC 8)

#### Màn hình Đăng nhập sau khi đăng xuất (UC 8)
Hình 124. Màn hình Đăng nhập sau khi đăng xuất (UC 8)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Input Text | Ô tên đăng nhập và mật khẩu để trống | Phiên đăng nhập đã kết thúc, chủ quán phải đăng nhập lại |
Bảng 130. Mô tả màn hình Đăng nhập sau khi đăng xuất (UC 8)

#### Màn hình Đăng xuất – Lỗi (UC 8)
Hình 125. Màn hình Đăng xuất – Lỗi (UC 8)
| STT | Loại | Mô tả | Ghi chú |
|---|---|---|---|
| 1 | Icon | Icon cảnh báo màu đỏ |  |
| 2 | Text | Thông báo “Có lỗi xảy ra, vui lòng thử lại!” | Hiện khi kết thúc phiên không thành công |
Bảng 131. Mô tả màn hình Đăng xuất – Lỗi (UC 8)

