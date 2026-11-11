from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.base import Base
from app.infrastructure.sql_types import enum_column


class PaymentMethod(StrEnum):
    TRANSFER = "Chuyển khoản"
    CASH = "Tiền mặt"


class OrderStatus(StrEnum):
    AWAITING_PAYMENT = "Chưa xác nhận thanh toán"
    PAID = "Đã xác nhận thanh toán"


class CafeOrder(Base):
    __tablename__ = "don_hang"
    __table_args__ = (
        CheckConstraint(
            "(trang_thai = 'Đã xác nhận thanh toán') = (thoi_gian_giao_dich IS NOT NULL)",
            name="ck_don_hang_gd",
        ),
        Index(
            "ix_don_hang_thoi_gian_dat",
            "thoi_gian_dat",
            postgresql_where=text("da_xoa = FALSE"),
        ),
    )

    ma_don_hang: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ma_ban: Mapped[int] = mapped_column(
        ForeignKey("ban.ma_ban", ondelete="RESTRICT"), nullable=False, index=True
    )
    thoi_gian_dat: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    phuong_thuc_thanh_toan: Mapped[PaymentMethod] = mapped_column(
        enum_column(PaymentMethod, "phuong_thuc_thanh_toan", length=20), nullable=False
    )
    trang_thai: Mapped[OrderStatus] = mapped_column(
        enum_column(OrderStatus, "trang_thai_don_hang", length=30),
        default=OrderStatus.AWAITING_PAYMENT,
        nullable=False,
    )
    ghi_chu: Mapped[str | None] = mapped_column(String(200))
    thoi_gian_giao_dich: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    da_xoa: Mapped[bool] = mapped_column(default=False, server_default="false", nullable=False)
    chi_tiet: Mapped[list["OrderItem"]] = relationship(back_populates="don_hang")


class OrderItem(Base):
    __tablename__ = "chi_tiet_don"
    __table_args__ = (
        CheckConstraint("gia > 0", name="ck_chi_tiet_don_gia_positive"),
        CheckConstraint("so_luong > 0", name="ck_chi_tiet_don_so_luong_positive"),
        Index("ix_chi_tiet_don_ma_mon", "ma_mon"),
    )

    ma_don_hang: Mapped[int] = mapped_column(
        ForeignKey("don_hang.ma_don_hang", ondelete="RESTRICT"), primary_key=True
    )
    ma_mon: Mapped[int] = mapped_column(
        ForeignKey("mon.ma_mon", ondelete="RESTRICT"), primary_key=True
    )
    ten_mon: Mapped[str] = mapped_column(String(50), nullable=False)
    gia: Mapped[int] = mapped_column(Integer, nullable=False)
    so_luong: Mapped[int] = mapped_column(Integer, nullable=False)

    don_hang: Mapped[CafeOrder] = relationship(back_populates="chi_tiet")
