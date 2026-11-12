from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.core.errors import AppError
from app.modules.auth.router import router as auth_router
from app.modules.menu.router import admin_router as admin_menu_router
from app.modules.menu.router import customer_router as customer_menu_router
from app.modules.orders.router import admin_router as admin_orders_router
from app.modules.orders.router import customer_router as customer_orders_router
from app.modules.orders.router import router as orders_router
from app.modules.sales.router import router as reports_router
from app.modules.tables.router import router as tables_router
from app.system.router import router as system_router

app = FastAPI(title="Cafe 458 API", version="0.1.0")
cors_origins = [
    origin.strip().rstrip("/")
    for origin in get_settings().frontend_base_url.split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(system_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(customer_menu_router, prefix="/api/v1")
app.include_router(customer_orders_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(admin_orders_router, prefix="/api/v1")
app.include_router(admin_menu_router, prefix="/api/v1")
app.include_router(tables_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")


@app.exception_handler(AppError)
async def app_error_handler(_: Request, error: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={
            "error": {
                "code": error.code,
                "message": error.message,
                "field": error.field,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, error: RequestValidationError) -> JSONResponse:
    errors = error.errors()
    first_err = errors[0] if errors else {}
    field_name = str(first_err["loc"][-1]) if first_err.get("loc") else None
    err_type = str(first_err.get("type", ""))
    msg = str(first_err.get("msg", ""))
    if msg.startswith("Value error, "):
        msg = msg[len("Value error, "):]

    # Rule 1: items or so_luong
    if field_name in {"items", "so_luong"} or any(
        loc in ("items", "so_luong") for err in errors for loc in err.get("loc", ())
    ):
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Vui lòng chọn ít nhất một món",
                    "field": "items",
                }
            },
        )

    # Rule 2: gia_ban
    if field_name == "gia_ban" or any("gia_ban" in err.get("loc", ()) for err in errors):
        if err_type in ("missing", "null") or "không được để trống" in msg.lower():
            message = "Không được để trống!"
        else:
            message = "Giá bán phải là số lớn hơn 0!"
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": message,
                    "field": "gia_ban",
                }
            },
        )

    # Rule 3: mandatory fields empty/missing
    mandatory_fields = {
        "ten_dang_nhap",
        "mat_khau",
        "ten_mon",
        "so_ban",
        "mat_khau_cu",
        "mat_khau_moi",
        "nhap_lai_mat_khau_moi",
    }
    if field_name in mandatory_fields:
        if (
            err_type in ("missing", "string_too_short", "null")
            or "không được để trống" in msg.lower()
            or not msg
        ):
            return JSONResponse(
                status_code=422,
                content={
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": "Không được để trống!",
                        "field": field_name,
                    }
                },
            )

    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": msg or "Dữ liệu không hợp lệ",
                "field": field_name,
            }
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_: Request, error: StarletteHTTPException) -> JSONResponse:
    code = "HTTP_ERROR"
    if error.status_code == 401:
        code = "UNAUTHORIZED"
    elif error.status_code == 404:
        code = "NOT_FOUND"
    elif error.status_code == 403:
        code = "FORBIDDEN"
    elif error.status_code == 400:
        code = "BAD_REQUEST"
    return JSONResponse(
        status_code=error.status_code,
        content={
            "error": {
                "code": code,
                "message": str(error.detail),
                "field": None,
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, _: Exception) -> JSONResponse:
    message = (
        "Đặt món không thành công, vui lòng thử lại!"
        if request.url.path.endswith("/customer/orders") and request.method == "POST"
        else "Có lỗi xảy ra, vui lòng thử lại!"
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": message,
                "field": None,
            }
        },
    )
