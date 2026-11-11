from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared metadata base for domain-owned SQLAlchemy models."""
