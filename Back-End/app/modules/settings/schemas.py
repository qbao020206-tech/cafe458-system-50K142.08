from pydantic import BaseModel, Field, model_validator


class OrderTimeoutUpdate(BaseModel):
    minutes: int = Field(ge=1, le=1440)


class OrderTimeoutSetting(BaseModel):
    minutes: int


class RecommendationLimitUpdate(BaseModel):
    limit: int | None = Field(default=None, ge=1)
    lookback_days: int | None = Field(default=None, ge=1, le=30)

    @model_validator(mode="after")
    def require_a_setting(self) -> "RecommendationLimitUpdate":
        if not self.model_fields_set:
            raise ValueError("Cần cung cấp số món hoặc khoảng thời gian cần cập nhật")
        if "lookback_days" in self.model_fields_set and self.lookback_days is None:
            raise ValueError("Khoảng thời gian đề cử phải từ 1 đến 30 ngày")
        return self


class RecommendationLimitSetting(BaseModel):
    limit: int | None
    lookback_days: int
