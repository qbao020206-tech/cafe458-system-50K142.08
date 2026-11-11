from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.errors import AppError
from app.modules.auth.router import router as auth_router
from app.modules.menu.router import admin_router as admin_menu_router
from app.modules.menu.router import customer_router as customer_menu_router
from app.modules.orders.router import admin_router as admin_orders_router
from app.modules.orders.router import customer_router as customer_orders_router
from app.modules.orders.router import router as orders_router
from app.modules.settings.router import router as settings_router
from app.modules.sales.router import router as reports_router
from app.modules.tables.router import router as tables_router
from app.system.router import router as system_router

app = FastAPI(title="Cafe 458 API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().frontend_base_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(system_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(customer_menu_router, prefix="/api/v1")
app.include_router(customer_orders_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(admin_orders_router, prefix="/api/v1")
app.include_router(admin_menu_router, prefix="/api/v1")
app.include_router(tables_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")


@app.exception_handler(AppError)
async def app_error_handler(_, error: AppError) -> JSONResponse:
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
