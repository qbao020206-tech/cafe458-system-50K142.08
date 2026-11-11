from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, Index, Integer, String, func, text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.base import Base
from app.infrastructure.sql_types import enum_column


class MenuItemStatus(StrEnum):
    VISIBLE = "Hiển thị"
    HIDDEN = "Ẩn"


class MenuItem(Base):
    __tablename__ = "mon"
    __table_args__ = (
        CheckConstraint("gia_ban > 0", name="ck_mon_gia_ban_positive"),
        CheckConstraint("length(trim(ten_mon)) > 0", name="ck_mon_ten_mon_nonempty"),
        Index(
            "uq_mon_ten_chua_xoa",
            func.lower(text("ten_mon")),
            unique=True,
            postgresql_where=text("da_xoa = FALSE"),
        ),
    )

    ma_mon: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ten_mon: Mapped[str] = mapped_column(String(50), nullable=False)
    gia_ban: Mapped[int] = mapped_column(Integer, nullable=False)
    hinh_anh: Mapped[str | None] = mapped_column(String(255))
    trang_thai: Mapped[MenuItemStatus] = mapped_column(
        enum_column(MenuItemStatus, "trang_thai_mon", length=20), default=MenuItemStatus.VISIBLE, nullable=False
    )
    da_xoa: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
