from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.modules.auth.security import require_owner
from app.modules.sales.service import report_details, revenue_by_period

router = APIRouter(prefix="/admin/reports", tags=["reports"])


@router.get("/revenue")
async def read_revenue(
    period: Literal["day", "month", "year"] = "day",
    date_value: str | None = Query(default=None, alias="date"),
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    return await revenue_by_period(session, period, date_value)


@router.get("/details")
async def read_report_details(
    period: Literal["day", "month", "year"] = "day",
    date_value: str | None = Query(default=None, alias="date"),
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    return await report_details(session, period, date_value)
