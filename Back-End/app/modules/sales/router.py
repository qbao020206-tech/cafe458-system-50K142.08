from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.modules.auth.security import require_owner
from app.modules.sales.schemas import ReportDetailsResponse, RevenueReportResponse
from app.modules.sales.service import report_details, revenue_by_period

router = APIRouter(prefix="/admin/reports", tags=["reports"])


@router.get("/revenue", response_model=RevenueReportResponse)
async def read_revenue(
    period: Literal["day", "month", "year"] = "day",
    date_value: str | None = Query(default=None, alias="date"),
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> RevenueReportResponse:
    data = await revenue_by_period(session, period, date_value)
    return RevenueReportResponse(**data)


@router.get("/details", response_model=ReportDetailsResponse)
async def read_report_details(
    period: Literal["day", "month", "year"] = "day",
    date_value: str | None = Query(default=None, alias="date"),
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> ReportDetailsResponse:
    data = await report_details(session, period, date_value)
    return ReportDetailsResponse(**data)
