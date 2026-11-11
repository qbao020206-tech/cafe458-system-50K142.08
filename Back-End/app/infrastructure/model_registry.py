"""Import domain models so Alembic can discover the complete metadata."""

from app.modules.auth.models import Owner
from app.modules.menu.models import MenuItem
from app.modules.orders.models import CafeOrder, OrderItem
from app.modules.tables.models import CafeTable

__all__ = ["CafeOrder", "CafeTable", "MenuItem", "OrderItem", "Owner"]
