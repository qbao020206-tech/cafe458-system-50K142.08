"""Initial schema with 5 core tables, constraints, partial indexes and RLS.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-11-12 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. chu_quan
    op.create_table(
        "chu_quan",
        sa.Column("ten_dang_nhap", sa.String(length=50), nullable=False),
        sa.Column("mat_khau", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("ten_dang_nhap", name="pk_chu_quan"),
    )

    # 2. ban
    op.create_table(
        "ban",
        sa.Column("ma_ban", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ten_dang_nhap", sa.String(length=50), nullable=False),
        sa.Column("so_ban", sa.String(length=10), nullable=False),
        sa.Column("trang_thai", sa.Enum("Trống", "Đang phục vụ", name="trang_thai_ban", length=20, native_enum=False), nullable=False, server_default="Trống"),
        sa.Column("ma_qr", sa.String(length=255), nullable=False),
        sa.Column("da_xoa", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.ForeignKeyConstraint(["ten_dang_nhap"], ["chu_quan.ten_dang_nhap"], name="fk_ban_ten_dang_nhap", ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("ma_ban", name="pk_ban"),
        sa.UniqueConstraint("ma_qr", name="uq_ban_ma_qr"),
        sa.CheckConstraint("length(trim(so_ban)) > 0", name="ck_ban_so_ban_nonempty"),
    )
    op.create_index(
        "uq_ban_so_ban_chua_xoa",
        "ban",
        ["so_ban"],
        unique=True,
        postgresql_where=sa.text("da_xoa = FALSE"),
    )

    # 3. mon
    op.create_table(
        "mon",
        sa.Column("ma_mon", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ten_mon", sa.String(length=50), nullable=False),
        sa.Column("gia_ban", sa.Integer(), nullable=False),
        sa.Column("hinh_anh", sa.String(length=255), nullable=True),
        sa.Column("trang_thai", sa.Enum("Hiển thị", "Ẩn", name="trang_thai_mon", length=20, native_enum=False), nullable=False, server_default="Hiển thị"),
        sa.Column("da_xoa", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.PrimaryKeyConstraint("ma_mon", name="pk_mon"),
        sa.CheckConstraint("gia_ban > 0", name="ck_mon_gia_ban_positive"),
        sa.CheckConstraint("length(trim(ten_mon)) > 0", name="ck_mon_ten_mon_nonempty"),
    )
    op.create_index(
        "uq_mon_ten_chua_xoa",
        "mon",
        [sa.text("lower(ten_mon)")],
        unique=True,
        postgresql_where=sa.text("da_xoa = FALSE"),
    )

    # 4. don_hang
    op.create_table(
        "don_hang",
        sa.Column("ma_don_hang", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ma_ban", sa.Integer(), nullable=False),
        sa.Column("thoi_gian_dat", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("phuong_thuc_thanh_toan", sa.Enum("Chuyển khoản", "Tiền mặt", name="phuong_thuc_thanh_toan", length=20, native_enum=False), nullable=False),
        sa.Column("trang_thai", sa.Enum("Chưa xác nhận thanh toán", "Đã xác nhận thanh toán", name="trang_thai_don_hang", length=30, native_enum=False), server_default="Chưa xác nhận thanh toán", nullable=False),
        sa.Column("ghi_chu", sa.String(length=200), nullable=True),
        sa.Column("thoi_gian_giao_dich", sa.DateTime(timezone=True), nullable=True),
        sa.Column("da_xoa", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.ForeignKeyConstraint(["ma_ban"], ["ban.ma_ban"], name="fk_don_hang_ma_ban", ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("ma_don_hang", name="pk_don_hang"),
        sa.CheckConstraint(
            "(trang_thai = 'Đã xác nhận thanh toán') = (thoi_gian_giao_dich IS NOT NULL)",
            name="ck_don_hang_gd",
        ),
    )
    op.create_index("ix_don_hang_ma_ban", "don_hang", ["ma_ban"])
    op.create_index(
        "ix_don_hang_thoi_gian_dat",
        "don_hang",
        ["thoi_gian_dat"],
        postgresql_where=sa.text("da_xoa = FALSE"),
    )

    # 5. chi_tiet_don
    op.create_table(
        "chi_tiet_don",
        sa.Column("ma_don_hang", sa.Integer(), nullable=False),
        sa.Column("ma_mon", sa.Integer(), nullable=False),
        sa.Column("ten_mon", sa.String(length=50), nullable=False),
        sa.Column("gia", sa.Integer(), nullable=False),
        sa.Column("so_luong", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["ma_don_hang"], ["don_hang.ma_don_hang"], name="fk_chi_tiet_don_don_hang", ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["ma_mon"], ["mon.ma_mon"], name="fk_chi_tiet_don_mon", ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("ma_don_hang", "ma_mon", name="pk_chi_tiet_don"),
        sa.CheckConstraint("gia > 0", name="ck_chi_tiet_don_gia_positive"),
        sa.CheckConstraint("so_luong > 0", name="ck_chi_tiet_don_so_luong_positive"),
    )
    op.create_index("ix_chi_tiet_don_ma_mon", "chi_tiet_don", ["ma_mon"])

    # 6. Enable Row Level Security for all 5 tables (QĐ-16)
    op.execute("ALTER TABLE chu_quan ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE ban ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE mon ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE don_hang ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE chi_tiet_don ENABLE ROW LEVEL SECURITY;")


def downgrade() -> None:
    op.drop_table("chi_tiet_don")
    op.drop_table("don_hang")
    op.drop_table("mon")
    op.drop_table("ban")
    op.drop_table("chu_quan")
