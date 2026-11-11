from pydantic import BaseModel, ConfigDict, Field


class OwnerLoginInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    username: str = Field(alias="ten_dang_nhap", min_length=1, max_length=50)
    password: str = Field(alias="mat_khau", min_length=1, max_length=200)


class ChangePasswordInput(BaseModel):
    current_password: str = Field(alias="mat_khau_cu", min_length=1, max_length=200)
    new_password: str = Field(alias="mat_khau_moi", min_length=1, max_length=200)
    confirm_new_password: str = Field(alias="nhap_lai_mat_khau_moi", min_length=1, max_length=200)

    model_config = ConfigDict(populate_by_name=True)

class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthMessage(BaseModel):
    message: str
