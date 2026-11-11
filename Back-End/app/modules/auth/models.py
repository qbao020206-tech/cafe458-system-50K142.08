from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.base import Base


class Owner(Base):
    __tablename__ = "chu_quan"

    ten_dang_nhap: Mapped[str] = mapped_column(String(50), primary_key=True)
    mat_khau: Mapped[str] = mapped_column(String(100), nullable=False)
