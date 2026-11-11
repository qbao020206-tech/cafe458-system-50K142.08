from enum import StrEnum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.base import Base
from app.infrastructure.sql_types import enum_column


class TableStatus(StrEnum):
    EMPTY = "Trống"
    SERVING = "Đang phục vụ"


class CafeTable(Base):
    __tablename__ = "ban"
    __table_args__ = (
        CheckConstraint("length(trim(so_ban)) > 0", name="ck_ban_so_ban_nonempty"),
        Index(
            "uq_ban_so_ban_chua_xoa",
            "so_ban",
            unique=True,
            postgresql_where=text("da_xoa = FALSE"),
        ),
        UniqueConstraint("ma_qr", name="uq_ban_ma_qr"),
    )

    ma_ban: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ten_dang_nhap: Mapped[str] = mapped_column(
        ForeignKey("chu_quan.ten_dang_nhap", ondelete="RESTRICT"), nullable=False
    )
    so_ban: Mapped[str] = mapped_column(String(10), nullable=False)
    trang_thai: Mapped[TableStatus] = mapped_column(
        enum_column(TableStatus, "trang_thai_ban", length=20), default=TableStatus.EMPTY, nullable=False
    )
    ma_qr: Mapped[str] = mapped_column(String(255), nullable=False)
    da_xoa: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
