# 03_data_model — PostgreSQL DDL, truy vấn mẫu, SQLAlchemy async (bổ sung)

> File bổ sung (không thay tài liệu gốc): bản dịch sang PostgreSQL, truy vấn mẫu và code SQLAlchemy 2.0 async. Thiết kế gốc nằm ở tài liệu "SƠ ĐỒ LỚP + THIẾT KẾ CƠ SỞ DỮ LIỆU"; nếu khác nhau, báo nhóm, không tự chọn. Quyết định QĐ-xx xem 05_quyet_dinh_va_audit.md.

## 0. Thiết kế gốc (không chép lại)

Không chép lại ở đây. Nguồn sự thật là tài liệu "SƠ ĐỒ LỚP + THIẾT KẾ CƠ SỞ DỮ LIỆU" (Hình 27, 28; Bảng 32, 33): khi cần tên cột, kiểu, ràng buộc gốc thì MỞ tài liệu đó, không suy từ file này. Tóm tắt để định hướng:
- 5 bảng: ChuQuan (PK tenDangNhap), Ban, Mon, DonHang, ChiTietDon (PK kép maDonHang + maMon). Ban/Mon/DonHang có `daXoa` (xóa mềm). Trạng thái và phương thức thanh toán lưu dạng chuỗi tiếng Việt nguyên văn.
- `DoanhThu`, `ThongKeBanHang`, `KhachHang` trong sơ đồ lớp là lớp phân tích, không có bảng; `tongTien`, `thanhTien` là thuộc tính dẫn xuất, tính từ ChiTietDon.
- Quy mô: ~20 bàn, ~50 món, ~60 đơn/ngày; không cần partition hay cache.

## 1. Dịch sang PostgreSQL (DDL v1 — QĐ-09, chờ nhóm duyệt)

Quy ước dịch: `Nvarchar`/`Varchar` → `VARCHAR(n)`; `Bit` → `BOOLEAN`; `Datetime` → `TIMESTAMPTZ`; `IDENTITY` → `GENERATED ALWAYS AS IDENTITY`; tên camelCase → snake_case (`tenDangNhap` → `ten_dang_nhap`). Trạng thái lưu nguyên văn tiếng Việt như thiết kế gốc, thêm `CHECK` (QĐ-11). Các dòng ghi chú "bổ sung" là ràng buộc thêm để thực thi business rule, không đổi thiết kế gốc.

```sql
CREATE TABLE chu_quan (
    ten_dang_nhap VARCHAR(50)  PRIMARY KEY CHECK (ten_dang_nhap ~ '^[!-~]+$'),  -- chỉ ký tự ASCII không dấu, không khoảng trắng
    mat_khau      VARCHAR(100) NOT NULL                                          -- băm bcrypt (60 ký tự), không lưu mật khẩu thô
);

CREATE TABLE ban (
    ma_ban        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_dang_nhap VARCHAR(50) NOT NULL REFERENCES chu_quan (ten_dang_nhap),      -- bổ sung NOT NULL
    so_ban        VARCHAR(10) NOT NULL,
    trang_thai    VARCHAR(20) NOT NULL DEFAULT 'Trống'
                  CHECK (trang_thai IN ('Trống', 'Đang phục vụ')),
    ma_qr         VARCHAR(255) NOT NULL,                                          -- token ngẫu nhiên 16 ký tự (QĐ-13)
    da_xoa        BOOLEAN NOT NULL DEFAULT FALSE
);
-- BR-UC4-04: số bàn duy nhất trong các bàn chưa xóa
CREATE UNIQUE INDEX uq_ban_so_ban_chua_xoa ON ban (so_ban) WHERE da_xoa = FALSE;
CREATE UNIQUE INDEX uq_ban_ma_qr ON ban (ma_qr);

CREATE TABLE mon (
    ma_mon     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_mon    VARCHAR(50) NOT NULL,
    gia_ban    INT NOT NULL CHECK (gia_ban > 0),
    hinh_anh   VARCHAR(255) NULL,                                                 -- đường dẫn đối tượng trong Supabase Storage (QĐ-06); NULL = hình mặc định
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'Hiển thị'
               CHECK (trang_thai IN ('Hiển thị', 'Ẩn')),
    da_xoa     BOOLEAN NOT NULL DEFAULT FALSE
);
-- BR-UC3-03: tên món duy nhất trong các món chưa xóa (không phân biệt hoa/thường, QĐ-20)
CREATE UNIQUE INDEX uq_mon_ten_chua_xoa ON mon (lower(ten_mon)) WHERE da_xoa = FALSE;

CREATE TABLE don_hang (
    ma_don_hang            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_ban                 INT NOT NULL REFERENCES ban (ma_ban),                  -- bổ sung NOT NULL
    thoi_gian_dat          TIMESTAMPTZ NOT NULL DEFAULT now(),
    phuong_thuc_thanh_toan VARCHAR(20) NOT NULL
                           CHECK (phuong_thuc_thanh_toan IN ('Chuyển khoản', 'Tiền mặt')),
    trang_thai             VARCHAR(30) NOT NULL DEFAULT 'Chưa xác nhận thanh toán'
                           CHECK (trang_thai IN ('Chưa xác nhận thanh toán', 'Đã xác nhận thanh toán')),
    ghi_chu                VARCHAR(200) NULL,
    thoi_gian_giao_dich    TIMESTAMPTZ NULL,
    da_xoa                 BOOLEAN NOT NULL DEFAULT FALSE,
    -- bổ sung: có thời gian giao dịch khi và chỉ khi đơn đã xác nhận thanh toán
    CONSTRAINT ck_don_hang_gd CHECK ((trang_thai = 'Đã xác nhận thanh toán') = (thoi_gian_giao_dich IS NOT NULL))
);
CREATE INDEX ix_don_hang_thoi_gian_dat ON don_hang (thoi_gian_dat DESC) WHERE da_xoa = FALSE;
CREATE INDEX ix_don_hang_doanh_thu ON don_hang (thoi_gian_giao_dich)
    WHERE da_xoa = FALSE AND trang_thai = 'Đã xác nhận thanh toán';
CREATE INDEX ix_don_hang_ma_ban ON don_hang (ma_ban);

CREATE TABLE chi_tiet_don (
    ma_don_hang INT NOT NULL REFERENCES don_hang (ma_don_hang),
    ma_mon      INT NOT NULL REFERENCES mon (ma_mon),
    ten_mon     VARCHAR(50) NOT NULL,                                             -- snapshot tại thời điểm đặt (BR-UC3-08)
    gia         INT NOT NULL CHECK (gia > 0),                                     -- snapshot (BR-UC3-10); bổ sung CHECK
    so_luong    INT NOT NULL CHECK (so_luong > 0),
    PRIMARY KEY (ma_don_hang, ma_mon)
);
CREATE INDEX ix_chi_tiet_don_ma_mon ON chi_tiet_don (ma_mon);

-- Supabase: bảng trong schema public mặc định lộ ra Data API. Bật RLS, KHÔNG tạo policy => anon/authenticated bị chặn.
-- Back-End kết nối bằng role postgres (bỏ qua RLS) qua SQLAlchemy. (QĐ-16)
ALTER TABLE chu_quan     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ban          ENABLE ROW LEVEL SECURITY;
ALTER TABLE mon          ENABLE ROW LEVEL SECURITY;
ALTER TABLE don_hang     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chi_tiet_don ENABLE ROW LEVEL SECURITY;
```

Seed tài khoản chủ quán (QĐ-15): script `scripts/seed_owner.py` đọc `OWNER_USERNAME`, `OWNER_PASSWORD` từ biến môi trường, băm bcrypt rồi `INSERT ... ON CONFLICT DO NOTHING`. Không commit mật khẩu.

Ánh xạ trạng thái/giá trị → thông báo/nhãn nằm trong 04_ui_screen_specs.md. Thông báo lỗi nguyên văn nằm trong 02_use_case_spec.md.

## 2. Truy vấn mẫu (múi giờ Asia/Ho_Chi_Minh, QĐ-14)

Doanh thu chỉ tính đơn `Đã xác nhận thanh toán` và `da_xoa = FALSE` (BR-UC5-01), gom theo `thoi_gian_giao_dich`. Tổng = tiền mặt + chuyển khoản (BR-UC5-02/06).

```sql
-- UC_5.1: tổng doanh thu theo kỳ ('day' | 'month' | 'year'), kỳ mới nhất trên cùng
SELECT date_trunc(:ky, d.thoi_gian_giao_dich AT TIME ZONE 'Asia/Ho_Chi_Minh') AS ky,
       COALESCE(SUM(c.gia * c.so_luong), 0) AS tong_doanh_thu
FROM don_hang d JOIN chi_tiet_don c USING (ma_don_hang)
WHERE d.da_xoa = FALSE AND d.trang_thai = 'Đã xác nhận thanh toán'
GROUP BY 1 ORDER BY 1 DESC;

-- UC_5.2: doanh thu theo phương thức trong kỳ [:bat_dau, :ket_thuc) (đã quy đổi sang timestamptz)
SELECT d.phuong_thuc_thanh_toan, SUM(c.gia * c.so_luong) AS doanh_thu
FROM don_hang d JOIN chi_tiet_don c USING (ma_don_hang)
WHERE d.da_xoa = FALSE AND d.trang_thai = 'Đã xác nhận thanh toán'
  AND d.thoi_gian_giao_dich >= :bat_dau AND d.thoi_gian_giao_dich < :ket_thuc
GROUP BY 1;

-- UC_5.3: số ly từng món, giảm dần; gắn "Bán chạy nhất" cho mọi món đồng hạng cao nhất (BR-UC5-09/10)
WITH ct AS (
  SELECT c.ma_mon,
         (array_agg(c.ten_mon ORDER BY d.thoi_gian_giao_dich DESC))[1] AS ten_mon,
         SUM(c.so_luong) AS so_ly
  FROM don_hang d JOIN chi_tiet_don c USING (ma_don_hang)
  WHERE d.da_xoa = FALSE AND d.trang_thai = 'Đã xác nhận thanh toán'
    AND d.thoi_gian_giao_dich >= :bat_dau AND d.thoi_gian_giao_dich < :ket_thuc
  GROUP BY c.ma_mon)
SELECT ten_mon, so_ly, so_ly = MAX(so_ly) OVER () AS ban_chay_nhat,
       SUM(so_ly) OVER () AS tong_so_ly                       -- BR-UC5-08
FROM ct ORDER BY so_ly DESC, ten_mon;
```

Tổng tiền đơn: `SELECT SUM(gia * so_luong) FROM chi_tiet_don WHERE ma_don_hang = :id`.

## 3. Mẫu truy cập dữ liệu: SQLAlchemy 2.0 async + asyncpg (quyết định của nhóm)

Cấu trúc đề xuất: `app/db/session.py`, `app/db/models.py`, `app/services/*.py`, `app/routers/*.py`, `app/schemas/*.py`, `alembic/`.

```python
# app/db/session.py
import os
from collections.abc import AsyncIterator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Direct Connection Supabase (cổng 5432):
# postgresql+asyncpg://postgres:<MAT_KHAU>@db.<project-ref>.supabase.co:5432/postgres
DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_async_engine(
    DATABASE_URL,
    pool_size=5, max_overflow=5,      # quán nhỏ: pool nhỏ là đủ
    pool_pre_ping=True, pool_recycle=1800,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:   # mỗi request một AsyncSession
        yield session
```

```python
# app/db/models.py (SQLAlchemy 2.0 declarative)
from datetime import datetime
from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime

class Base(DeclarativeBase): ...

class ChuQuan(Base):
    __tablename__ = "chu_quan"
    ten_dang_nhap: Mapped[str] = mapped_column(String(50), primary_key=True)
    mat_khau: Mapped[str] = mapped_column(String(100))

class Ban(Base):
    __tablename__ = "ban"
    ma_ban: Mapped[int] = mapped_column(primary_key=True)  # IDENTITY do migration tạo
    ten_dang_nhap: Mapped[str] = mapped_column(ForeignKey("chu_quan.ten_dang_nhap"))
    so_ban: Mapped[str] = mapped_column(String(10))
    trang_thai: Mapped[str] = mapped_column(String(20), default="Trống")
    ma_qr: Mapped[str] = mapped_column(String(255), unique=True)
    da_xoa: Mapped[bool] = mapped_column(Boolean, default=False)

class Mon(Base):
    __tablename__ = "mon"
    ma_mon: Mapped[int] = mapped_column(primary_key=True)
    ten_mon: Mapped[str] = mapped_column(String(50))
    gia_ban: Mapped[int] = mapped_column(Integer)
    hinh_anh: Mapped[str | None] = mapped_column(String(255))
    trang_thai: Mapped[str] = mapped_column(String(20), default="Hiển thị")
    da_xoa: Mapped[bool] = mapped_column(Boolean, default=False)

class DonHang(Base):
    __tablename__ = "don_hang"
    ma_don_hang: Mapped[int] = mapped_column(primary_key=True)
    ma_ban: Mapped[int] = mapped_column(ForeignKey("ban.ma_ban"))
    thoi_gian_dat: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    phuong_thuc_thanh_toan: Mapped[str] = mapped_column(String(20))
    trang_thai: Mapped[str] = mapped_column(String(30), default="Chưa xác nhận thanh toán")
    ghi_chu: Mapped[str | None] = mapped_column(String(200))
    thoi_gian_giao_dich: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    da_xoa: Mapped[bool] = mapped_column(Boolean, default=False)
    chi_tiet: Mapped[list["ChiTietDon"]] = relationship(back_populates="don_hang", cascade="all, delete-orphan")

class ChiTietDon(Base):
    __tablename__ = "chi_tiet_don"
    ma_don_hang: Mapped[int] = mapped_column(ForeignKey("don_hang.ma_don_hang"), primary_key=True)
    ma_mon: Mapped[int] = mapped_column(ForeignKey("mon.ma_mon"), primary_key=True)
    ten_mon: Mapped[str] = mapped_column(String(50))
    gia: Mapped[int] = mapped_column(Integer)
    so_luong: Mapped[int] = mapped_column(Integer)
    don_hang: Mapped[DonHang] = relationship(back_populates="chi_tiet")
```

Giao dịch đa bảng khi tạo đơn (UC_7.2 bước 13–15: đơn + chi tiết + bàn "Đang phục vụ" phải thành công cùng nhau, nếu không thì rollback và trả "Đặt món không thành công, vui lòng thử lại!"):

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def tao_don(session: AsyncSession, qr: str, items: list[tuple[int, int]],
                  phuong_thuc: str, ghi_chu: str | None) -> int:
    async with session.begin():                       # một transaction cho cả 3 thao tác
        ban = (await session.execute(
            select(Ban).where(Ban.ma_qr == qr, Ban.da_xoa.is_(False)).with_for_update()
        )).scalar_one_or_none()
        if ban is None:
            raise AppError("QR_INVALID", "Mã QR không hợp lệ", status=404)

        gop: dict[int, int] = {}                      # gộp món trùng vì PK (ma_don_hang, ma_mon)
        for ma_mon, sl in items:
            gop[ma_mon] = gop.get(ma_mon, 0) + sl
        mons = {m.ma_mon: m for m in (await session.execute(
            select(Mon).where(Mon.ma_mon.in_(gop), Mon.da_xoa.is_(False), Mon.trang_thai == "Hiển thị")
        )).scalars()}
        if not gop or len(mons) != len(gop) or any(sl <= 0 for sl in gop.values()):
            raise AppError("ORDER_INVALID", "Đặt món không thành công, vui lòng thử lại!", status=422)

        don = DonHang(ma_ban=ban.ma_ban, phuong_thuc_thanh_toan=phuong_thuc, ghi_chu=ghi_chu or None)
        don.chi_tiet = [ChiTietDon(ma_mon=i, ten_mon=mons[i].ten_mon, gia=mons[i].gia_ban, so_luong=sl)
                        for i, sl in gop.items()]     # giá lấy từ DB, KHÔNG tin giá từ client (BR-UC7-03)
        session.add(don)
        ban.trang_thai = "Đang phục vụ"               # BR-UC4-01
        await session.flush()
        return don.ma_don_hang
```

Xác nhận đã nhận tiền chỉ một lần (BR-UC2-01), an toàn khi bấm hai lần: `UPDATE don_hang SET trang_thai='Đã xác nhận thanh toán', thoi_gian_giao_dich=now() WHERE ma_don_hang=:id AND da_xoa=FALSE AND trang_thai='Chưa xác nhận thanh toán'`; 0 dòng bị ảnh hưởng → không đổi gì.

## 4. Supabase: lưu ý kết nối (đã kiểm chứng với tài liệu Supabase, 11/2026)

- Direct Connection (db.<ref>.supabase.co:5432) mặc định chạy trên IPv6; chỉ có IPv4 khi project mua add-on IPv4. Máy dev hoặc nơi deploy chỉ có IPv4 sẽ không kết nối được. Khi đó dùng Session Pooler (cổng 5432, host pooler, user `postgres.<project-ref>`): chỉ đổi `DATABASE_URL`, code giữ nguyên.
- Không dùng Transaction Pooler (cổng 6543) cho API này; nếu buộc phải dùng thì tắt prepared statements của asyncpg (`connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0}`).
- Chạy Alembic migration bằng Direct Connection hoặc Session Pooler.
- Mật khẩu DB, `service_role` key, JWT secret chỉ nằm ở biến môi trường Back-End (`.env`, đã `.gitignore`); không bao giờ đưa vào Front-End hoặc Git.
