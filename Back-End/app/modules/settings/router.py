from fastapi import APIRouter, Depends

from app.modules.auth.security import require_owner
from app.modules.settings.schemas import (
    OrderTimeoutSetting,
    OrderTimeoutUpdate,
    RecommendationLimitSetting,
    RecommendationLimitUpdate,
)
from app.modules.settings.service import (
    get_transfer_confirmation_timeout,
    get_recommendation_settings,
    set_recommendation_settings,
    set_transfer_confirmation_timeout,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/order-timeout", response_model=OrderTimeoutSetting)
async def read_order_timeout(
    _: str = Depends(require_owner),
) -> OrderTimeoutSetting:
    return OrderTimeoutSetting(minutes=await get_transfer_confirmation_timeout())


@router.put("/order-timeout", response_model=OrderTimeoutSetting)
async def update_order_timeout(
    request: OrderTimeoutUpdate,
    _: str = Depends(require_owner),
) -> OrderTimeoutSetting:
    minutes = await set_transfer_confirmation_timeout(request.minutes)
    return OrderTimeoutSetting(minutes=minutes)


@router.get("/recommendations", response_model=RecommendationLimitSetting)
async def read_recommendation_limit(
    _: str = Depends(require_owner),
) -> RecommendationLimitSetting:
    limit, lookback_days = await get_recommendation_settings()
    return RecommendationLimitSetting(limit=limit, lookback_days=lookback_days)


@router.put("/recommendations", response_model=RecommendationLimitSetting)
async def update_recommendation_limit(
    request: RecommendationLimitUpdate,
    _: str = Depends(require_owner),
) -> RecommendationLimitSetting:
    limit, lookback_days = await set_recommendation_settings(
        limit=request.limit if "limit" in request.model_fields_set else ...,
        lookback_days=(
            request.lookback_days if "lookback_days" in request.model_fields_set else ...
        ),
    )
    return RecommendationLimitSetting(limit=limit, lookback_days=lookback_days)
